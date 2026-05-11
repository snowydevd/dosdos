import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

/**
 * Trae el perfil completo del usuario autenticado.
 */
export function useMiPerfil(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, fotos:photos(*)')
        .eq('id', userId!)
        .single();

      if (error) throw error;
      return data as User;
    },
  });
}

/**
 * Actualiza el perfil del usuario.
 */
export function useActualizarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Pick<User, 'nombre' | 'bio' | 'ciudad' | 'genero'>>;
    }) => {
      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}

/**
 * Sube una foto al Storage de Supabase y guarda la referencia en la DB.
 */
export function useSubirFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      uri,
      orden,
    }: {
      userId: string;
      uri: string;
      orden: number;
    }) => {
      const extension = uri.split('.').pop() ?? 'jpg';
      const fileName = `${userId}/${Date.now()}.${extension}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('fotos-perfil')
        .upload(fileName, arrayBuffer, { contentType: `image/${extension}` });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fotos-perfil')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('photos').insert({
        userId,
        url: publicUrl,
        orden,
      });

      if (dbError) throw dbError;

      return publicUrl;
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}

/**
 * Elimina una foto del perfil.
 */
export function useEliminarFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fotoId, userId }: { fotoId: string; userId: string }) => {
      const { error } = await supabase.from('photos').delete().eq('id', fotoId);
      if (error) throw error;
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}
