import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Duo, DuoCard } from '@/types';

/**
 * Trae los dúos disponibles para descubrir.
 *
 * Criterios de exclusión:
 *  - El propio dúo del usuario
 *  - Dúos a los que el usuario ya swipeó
 *  - Dúos inactivos
 *  - Dúos de diferente ciudad (MVP: mismo ciudad)
 */
export function useDuosParaDescubrir({
  miDuoId,
  ciudad,
  userId,
}: {
  miDuoId: string;
  ciudad: string;
  userId: string;
}) {
  return useQuery({
    queryKey: ['discover', miDuoId, ciudad],
    enabled: !!miDuoId && !!ciudad,
    queryFn: async () => {
      // IDs de dúos que el usuario ya swipeó
      const { data: swipesYaHechos } = await supabase
        .from('swipes')
        .select('targetDuoId')
        .eq('swiperUserId', userId);

      const yaSwipeados = (swipesYaHechos ?? []).map((s) => s.targetDuoId);

      // Traer dúos activos de la misma ciudad, excluyendo el propio y los ya swipeados
      const { data, error } = await supabase
        .from('duos')
        .select(
          `
          *,
          miembros:duo_members(
            *,
            user:users(*, fotos:photos(*))
          )
        `,
        )
        .eq('activo', true)
        .neq('id', miDuoId)
        .not('id', 'in', `(${[miDuoId, ...yaSwipeados].join(',')})`)
        .limit(20);

      if (error) throw error;

      // Filtrar por ciudad (los miembros del dúo deben estar en la ciudad)
      const duosFiltrados = (data as Duo[]).filter((duo) =>
        duo.miembros.some((m) => m.user.ciudad === ciudad),
      );

      // Mapear a DuoCard para la UI
      const cards: DuoCard[] = duosFiltrados.map((duo) => ({
        duo,
        miembro1: duo.miembros[0].user,
        miembro2: duo.miembros[1]?.user ?? duo.miembros[0].user,
      }));

      return cards;
    },
  });
}

/**
 * Registra un swipe individual y verifica si se completó el "like de dúo"
 * (ambos miembros del dúo A swipearon RIGHT al dúo B).
 *
 * Si ambos swipearon RIGHT y el dúo B también ya lo hizo → crea el Match.
 */
export function useRegistrarSwipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      swiperUserId,
      swiperDuoId,
      targetDuoId,
      direccion,
    }: {
      swiperUserId: string;
      swiperDuoId: string;
      targetDuoId: string;
      direccion: 'LEFT' | 'RIGHT';
    }) => {
      // Registrar el swipe individual
      const { error: swipeError } = await supabase.from('swipes').insert({
        swiperUserId,
        swiperDuoId,
        targetDuoId,
        direccion,
      });
      if (swipeError) throw swipeError;

      if (direccion === 'LEFT') return { match: false };

      // Verificar si el OTRO miembro del dúo también swipeó RIGHT al mismo target
      const { data: duo } = await supabase
        .from('duo_members')
        .select('userId')
        .eq('duoId', swiperDuoId);

      const compañeroId = (duo ?? []).find((m) => m.userId !== swiperUserId)?.userId;
      if (!compañeroId) return { match: false };

      const { data: compañeroSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiperUserId', compañeroId)
        .eq('targetDuoId', targetDuoId)
        .eq('direccion', 'RIGHT')
        .maybeSingle();

      if (!compañeroSwipe) return { match: false };

      // Ambos del dúo A swipearon RIGHT al dúo B.
      // Verificar si el dúo B también le dio RIGHT al dúo A (match mutuo).
      const { data: swipesBDuoHaciaA } = await supabase
        .from('swipes')
        .select('swiperUserId')
        .eq('swiperDuoId', targetDuoId)
        .eq('targetDuoId', swiperDuoId)
        .eq('direccion', 'RIGHT');

      // Obtener los miembros del dúo B
      const { data: miembrosDuoB } = await supabase
        .from('duo_members')
        .select('userId')
        .eq('duoId', targetDuoId);

      const miembrosBIds = (miembrosDuoB ?? []).map((m) => m.userId);
      const swipesRightDeB = (swipesBDuoHaciaA ?? []).map((s) => s.swiperUserId);

      const ambosDeBSwipearon = miembrosBIds.every((id) => swipesRightDeB.includes(id));
      if (!ambosDeBSwipearon) return { match: false };

      // ¡Match mutuo! Crear el Match y el Chat
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({ duoAId: swiperDuoId, duoBId: targetDuoId })
        .select()
        .single();
      if (matchError && matchError.code !== '23505') throw matchError; // ignorar duplicados

      if (match) {
        await supabase.from('chats').insert({ matchId: match.id });
      }

      return { match: true, matchId: match?.id };
    },
    onSuccess: (_data, { swiperDuoId }) => {
      qc.invalidateQueries({ queryKey: ['discover', swiperDuoId] });
      qc.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
