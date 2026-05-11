import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Duo, DuoInvitation, User } from '@/types';

// ────────────────────────────────────────────
// QUERIES
// ────────────────────────────────────────────

/**
 * Trae el dúo activo del usuario autenticado (si tiene uno).
 */
export function useMiDuo(userId: string | undefined) {
  return useQuery({
    queryKey: ['duo', 'mi-duo', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duo_members')
        .select(
          `
          *,
          duo:duos(
            *,
            miembros:duo_members(
              *,
              user:users(*, fotos:photos(*))
            )
          )
        `,
        )
        .eq('userId', userId!)
        .single();

      if (error && error.code === 'PGRST116') return null; // no tiene dúo
      if (error) throw error;

      const duo = data?.duo as Duo;
      return duo?.activo ? duo : null;
    },
  });
}

/**
 * Trae las invitaciones pendientes recibidas por el usuario.
 */
export function useInvitacionesPendientes(userId: string | undefined) {
  return useQuery({
    queryKey: ['duo', 'invitaciones', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duo_invitations')
        .select('*, inviter:users!inviterId(*, fotos:photos(*))')
        .eq('inviteeId', userId!)
        .eq('estado', 'PENDING')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data as DuoInvitation[];
    },
  });
}

// ────────────────────────────────────────────
// MUTATIONS
// ────────────────────────────────────────────

/**
 * Busca un usuario por email para invitarlo al dúo.
 */
export function useBuscarUsuarioPorEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('id, nombre, email, fotos:photos(*)')
        .eq('email', email)
        .single();

      if (error) throw new Error('No encontramos ningún usuario con ese email.');
      return data as User;
    },
  });
}

/**
 * Envía una invitación de dúo a otro usuario.
 */
export function useEnviarInvitacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inviterId,
      inviteeId,
    }: {
      inviterId: string;
      inviteeId: string;
    }) => {
      const { error } = await supabase.from('duo_invitations').insert({
        inviterId,
        inviteeId,
        estado: 'PENDING',
      });
      if (error) throw error;
    },
    onSuccess: (_data, { inviterId }) => {
      qc.invalidateQueries({ queryKey: ['duo', 'invitaciones', inviterId] });
    },
  });
}

/**
 * Acepta una invitación: crea el Duo y ambos DuoMembers.
 * La lógica de "solo un dúo activo" se verifica antes de llamar.
 */
export function useAceptarInvitacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invitation,
      currentUserId,
    }: {
      invitation: DuoInvitation;
      currentUserId: string;
    }) => {
      // 1. Crear el Duo
      const { data: duo, error: duoError } = await supabase
        .from('duos')
        .insert({ activo: true })
        .select()
        .single();
      if (duoError) throw duoError;

      // 2. Agregar ambos miembros
      const { error: membersError } = await supabase.from('duo_members').insert([
        { duoId: duo.id, userId: invitation.inviterId, rol: 'CREATOR' },
        { duoId: duo.id, userId: currentUserId, rol: 'MEMBER' },
      ]);
      if (membersError) throw membersError;

      // 3. Marcar la invitación como aceptada
      const { error: invError } = await supabase
        .from('duo_invitations')
        .update({ estado: 'ACCEPTED', respondedAt: new Date().toISOString() })
        .eq('id', invitation.id);
      if (invError) throw invError;

      return duo;
    },
    onSuccess: (_data, { currentUserId, invitation }) => {
      qc.invalidateQueries({ queryKey: ['duo', 'mi-duo', currentUserId] });
      qc.invalidateQueries({ queryKey: ['duo', 'mi-duo', invitation.inviterId] });
      qc.invalidateQueries({ queryKey: ['duo', 'invitaciones', currentUserId] });
    },
  });
}

/**
 * Rechaza una invitación de dúo.
 */
export function useRechazarInvitacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invitationId,
      userId,
    }: {
      invitationId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from('duo_invitations')
        .update({ estado: 'REJECTED', respondedAt: new Date().toISOString() })
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['duo', 'invitaciones', userId] });
    },
  });
}

/**
 * Disuelve el dúo activo (marca activo=false).
 * Ambos miembros quedan libres para formar un nuevo dúo.
 */
export function useDeshacerDuo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ duoId, userId }: { duoId: string; userId: string }) => {
      const { error } = await supabase
        .from('duos')
        .update({ activo: false })
        .eq('id', duoId);
      if (error) throw error;
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['duo', 'mi-duo', userId] });
    },
  });
}

/**
 * Actualiza la bio conjunta del dúo.
 */
export function useActualizarBioDuo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ duoId, bioConjunta }: { duoId: string; bioConjunta: string }) => {
      const { error } = await supabase
        .from('duos')
        .update({ bioConjunta })
        .eq('id', duoId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['duo'] });
    },
  });
}
