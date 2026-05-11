import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { useMiPerfil } from '@/lib/queries/user';
import { useMiDuo } from '@/lib/queries/duo';

/**
 * Punto de entrada — redirige según el estado de auth y onboarding.
 *
 * Flujo:
 *  1. Sin sesión → (auth)/login
 *  2. Con sesión pero sin perfil completo → (onboarding)/perfil
 *  3. Con perfil pero sin dúo activo → (onboarding)/linkear-duo
 *  4. Con todo completo → (tabs)/descubrir
 */
export default function Index() {
  const { session, isLoading, setPerfil } = useAuthStore();
  const userId = session?.user?.id;

  const { data: perfil, isLoading: perfilLoading } = useMiPerfil(userId);
  const { data: duo, isLoading: duoLoading } = useMiDuo(userId);

  useEffect(() => {
    if (perfil) setPerfil(perfil);
  }, [perfil, setPerfil]);

  if (isLoading || perfilLoading || duoLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B47" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!perfil) return <Redirect href="/(onboarding)/perfil" />;
  if (!duo) return <Redirect href="/(onboarding)/linkear-duo" />;
  return <Redirect href="/(tabs)/descubrir" />;
}
