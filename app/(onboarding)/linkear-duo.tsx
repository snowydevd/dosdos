import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import {
  useInvitacionesPendientes,
  useBuscarUsuarioPorEmail,
  useEnviarInvitacion,
  useAceptarInvitacion,
  useRechazarInvitacion,
} from '@/lib/queries/duo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import type { DuoInvitation, User } from '@/types';

/**
 * Pantalla para linkear al wingman/winggirl y formar el dúo.
 *
 * Opciones:
 *  1. Buscar por email y enviar invitación
 *  2. Ver invitaciones pendientes recibidas y aceptar/rechazar
 */
export default function LinkearDuoScreen() {
  const { supabaseUser } = useAuthStore();
  const userId = supabaseUser?.id ?? '';

  const { data: invitaciones, isLoading: loadingInvitaciones } =
    useInvitacionesPendientes(userId);

  const buscarUsuario = useBuscarUsuarioPorEmail();
  const enviarInvitacion = useEnviarInvitacion();
  const aceptarInvitacion = useAceptarInvitacion();
  const rechazarInvitacion = useRechazarInvitacion();

  const [email, setEmail] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<User | null>(null);

  const handleBuscar = async () => {
    if (!email.trim()) return;
    try {
      const usuario = await buscarUsuario.mutateAsync(email.trim().toLowerCase());
      setUsuarioEncontrado(usuario);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No encontramos a ese usuario';
      Alert.alert('Usuario no encontrado', msg);
      setUsuarioEncontrado(null);
    }
  };

  const handleEnviarInvitacion = async () => {
    if (!usuarioEncontrado) return;
    try {
      await enviarInvitacion.mutateAsync({
        inviterId: userId,
        inviteeId: usuarioEncontrado.id,
      });
      Alert.alert('¡Listo!', `Le enviamos una invitación a ${usuarioEncontrado.nombre}.`);
      setEmail('');
      setUsuarioEncontrado(null);
    } catch {
      Alert.alert('Error', 'No se pudo enviar la invitación. Intentá de nuevo.');
    }
  };

  const handleAceptar = async (inv: DuoInvitation) => {
    try {
      await aceptarInvitacion.mutateAsync({ invitation: inv, currentUserId: userId });
      Alert.alert('¡Dúo formado!', `Ahora sos dúo con ${inv.inviter.nombre} 🎉`);
      router.replace('/(tabs)/descubrir');
    } catch {
      Alert.alert('Error', 'No se pudo aceptar la invitación. Intentá de nuevo.');
    }
  };

  const handleRechazar = async (inv: DuoInvitation) => {
    await rechazarInvitacion.mutateAsync({
      invitationId: inv.id,
      userId,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 32 }}
      >
        {/* Header */}
        <View className="gap-y-2 pt-8">
          <Text className="text-3xl font-black text-neutral-900">Armá tu dúo</Text>
          <Text className="text-neutral-500 text-base leading-6">
            El formato 2x2 necesita que formes pareja con tu wingman o winggirl.
            Cuando ambos confirmen, van al pool de matching.
          </Text>
        </View>

        {/* Buscar wingman por email */}
        <View className="gap-y-4">
          <Text className="text-lg font-bold text-neutral-900">Invitar por email</Text>
          <View className="flex-row gap-x-2">
            <View className="flex-1">
              <Input
                placeholder="email de tu wingman/girl"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setUsuarioEncontrado(null);
                }}
              />
            </View>
            <Button
              label="Buscar"
              onPress={handleBuscar}
              isLoading={buscarUsuario.isPending}
              size="md"
            />
          </View>

          {/* Resultado de búsqueda */}
          {usuarioEncontrado && (
            <Card className="flex-row items-center gap-x-3">
              <Avatar
                uri={usuarioEncontrado.fotos?.[0]?.url}
                nombre={usuarioEncontrado.nombre}
                size="md"
              />
              <View className="flex-1">
                <Text className="font-semibold text-neutral-900">
                  {usuarioEncontrado.nombre}
                </Text>
                <Text className="text-sm text-neutral-500">{usuarioEncontrado.email}</Text>
              </View>
              <Button
                label="Invitar"
                onPress={handleEnviarInvitacion}
                isLoading={enviarInvitacion.isPending}
                size="sm"
              />
            </Card>
          )}
        </View>

        {/* Invitaciones recibidas */}
        <View className="gap-y-4">
          <Text className="text-lg font-bold text-neutral-900">
            Invitaciones recibidas{' '}
            {(invitaciones?.length ?? 0) > 0 && (
              <Text className="text-primary">({invitaciones?.length})</Text>
            )}
          </Text>

          {loadingInvitaciones ? (
            <ActivityIndicator color="#FF6B47" />
          ) : !invitaciones?.length ? (
            <Text className="text-neutral-400 text-sm">
              Todavía no recibiste ninguna invitación.
            </Text>
          ) : (
            invitaciones.map((inv) => (
              <Card key={inv.id} className="gap-y-3">
                <View className="flex-row items-center gap-x-3">
                  <Avatar
                    uri={inv.inviter.fotos?.[0]?.url}
                    nombre={inv.inviter.nombre}
                    size="md"
                  />
                  <View className="flex-1">
                    <Text className="font-semibold text-neutral-900">
                      {inv.inviter.nombre}
                    </Text>
                    <Text className="text-sm text-neutral-500">
                      te invitó a ser su dúo
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-x-2">
                  <Button
                    label="Rechazar"
                    variant="outline"
                    size="sm"
                    onPress={() => handleRechazar(inv)}
                    isLoading={rechazarInvitacion.isPending}
                    className="flex-1"
                  />
                  <Button
                    label="¡Aceptar!"
                    size="sm"
                    onPress={() => handleAceptar(inv)}
                    isLoading={aceptarInvitacion.isPending}
                    className="flex-1"
                  />
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Info de por qué es necesario */}
      <View className="p-6 bg-primary-50 border-t border-primary-100">
        <Text className="text-primary-700 text-sm text-center leading-5">
          💡 Hasta no tener tu dúo confirmado, no podés ver otros dúos ni hacer match.
        </Text>
      </View>
    </View>
  );
}
