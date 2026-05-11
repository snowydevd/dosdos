import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Chat, Match, MatchWithChat, Message } from '@/types';

/**
 * Trae todos los matches del dúo del usuario, con el último mensaje de cada chat.
 */
export function useMisMatches(duoId: string | undefined) {
  return useQuery({
    queryKey: ['matches', duoId],
    enabled: !!duoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          `
          *,
          duoA:duos!duoAId(*, miembros:duo_members(*, user:users(*, fotos:photos(*)))),
          duoB:duos!duoBId(*, miembros:duo_members(*, user:users(*, fotos:photos(*)))),
          chat:chats(
            *,
            mensajes:messages(*, sender:users(nombre))
          )
        `,
        )
        .or(`duoAId.eq.${duoId},duoBId.eq.${duoId}`)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      // Construir MatchWithChat con el último mensaje y noLeidos
      return (data as Match[]).map((match): MatchWithChat => {
        const mensajes = (match.chat?.mensajes ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return {
          ...match,
          ultimoMensaje: mensajes[0],
          noLeidos: 0, // simplificado para MVP
        };
      });
    },
  });
}

/**
 * Trae los mensajes de un chat (paginados por fecha).
 */
export function useMensajesChat(chatId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['chat', chatId, 'mensajes'],
    enabled: !!chatId,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const PAGE_SIZE = 30;
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users(id, nombre, fotos:photos(url, orden))')
        .eq('chatId', chatId!)
        .order('createdAt', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      return { mensajes: data as Message[], nextPage: pageParam + 1, hasMore: data.length === PAGE_SIZE };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
  });
}

/**
 * Hook para suscribirse al chat en tiempo real vía Supabase Realtime.
 * Actualiza el caché de React Query cuando llegan nuevos mensajes.
 */
export function useChatRealtime(chatId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatId=eq.${chatId}`,
        },
        async (payload) => {
          // Traer el mensaje completo con el sender
          const { data } = await supabase
            .from('messages')
            .select('*, sender:users(id, nombre, fotos:photos(url, orden))')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            qc.setQueryData<ReturnType<typeof useMensajesChat>['data']>(
              ['chat', chatId, 'mensajes'],
              (old) => {
                if (!old) return old;
                const firstPage = old.pages[0];
                return {
                  ...old,
                  pages: [
                    { ...firstPage, mensajes: [data as Message, ...firstPage.mensajes] },
                    ...old.pages.slice(1),
                  ],
                };
              },
            );
            qc.invalidateQueries({ queryKey: ['matches'] });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, qc]);
}

/**
 * Envía un mensaje al chat.
 */
export function useEnviarMensaje() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      senderId,
      contenido,
    }: {
      chatId: string;
      senderId: string;
      contenido: string;
    }) => {
      const { error } = await supabase.from('messages').insert({
        chatId,
        senderId,
        contenido,
        leidoPor: [senderId],
      });
      if (error) throw error;
    },
    onSuccess: (_data, { chatId }) => {
      qc.invalidateQueries({ queryKey: ['chat', chatId, 'mensajes'] });
    },
  });
}

/**
 * Marca todos los mensajes del chat como leídos por el usuario.
 */
export function useMarcarMensajesLeidos() {
  return useMutation({
    mutationFn: async ({ chatId, userId }: { chatId: string; userId: string }) => {
      // Obtener mensajes no leídos
      const { data: mensajes } = await supabase
        .from('messages')
        .select('id, leidoPor')
        .eq('chatId', chatId)
        .not('leidoPor', 'cs', `{${userId}}`);

      if (!mensajes?.length) return;

      // Actualizar cada mensaje para agregar userId a leidoPor
      await Promise.all(
        mensajes.map((m) =>
          supabase
            .from('messages')
            .update({ leidoPor: [...m.leidoPor, userId] })
            .eq('id', m.id),
        ),
      );
    },
  });
}
