import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { useMiPerfil } from '@/lib/queries/user';
import { useMiDuo } from '@/lib/queries/duo';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const { session, isLoading, setPerfil } = useAuthStore();
  const userId = session?.user?.id;

  const { data: perfil, isLoading: perfilLoading, isError: perfilError } = useMiPerfil(userId);
  const { data: duo, isLoading: duoLoading } = useMiDuo(userId);

  useEffect(() => {
    if (perfil) setPerfil(perfil);
  }, [perfil, setPerfil]);

  // Registro incompleto: hay sesión pero no existe el registro en users.
  // Limpiamos la sesión para que el usuario pueda volver a registrarse.
  useEffect(() => {
    if (session && !perfilLoading && perfilError) {
      supabase.auth.signOut();
    }
  }, [session, perfilLoading, perfilError]);

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
