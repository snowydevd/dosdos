import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useMiPerfil } from '@/lib/queries/user';
import { useMiDuo, useDeshacerDuo } from '@/lib/queries/duo';
import { useLogout } from '@/lib/queries/auth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { calcularEdad, labelGenero } from '@/lib/utils';

export default function PerfilScreen() {
  const { supabaseUser, logout: logoutStore } = useAuthStore();
  const userId = supabaseUser?.id ?? '';

  const { data: perfil, isLoading } = useMiPerfil(userId);
  const { data: miDuo } = useMiDuo(userId);
  const deshacerDuo = useDeshacerDuo();
  const logout = useLogout();

  const compañero = miDuo?.miembros.find((m) => m.userId !== userId);

  const handleDeshacerDuo = () => {
    Alert.alert(
      'Deshacer dúo',
      '¿Seguro? Ambos quedarán sin dúo activo y sus matches no se perderán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, deshacer',
          style: 'destructive',
          onPress: async () => {
            if (!miDuo) return;
            await deshacerDuo.mutateAsync({ duoId: miDuo.id, userId });
            router.replace('/(onboarding)/linkear-duo');
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    logoutStore();
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B47" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header con foto */}
      <View className="bg-primary-50 pt-14 pb-8 items-center gap-y-3">
        <Avatar
          uri={perfil?.fotos?.[0]?.url}
          nombre={perfil?.nombre}
          size="xl"
          className="border-4 border-white shadow-md"
        />
        <View className="items-center">
          <Text className="text-2xl font-black text-neutral-900">{perfil?.nombre}</Text>
          {perfil && (
            <Text className="text-neutral-500">
              {calcularEdad(perfil.fechaNacimiento)} años · {labelGenero(perfil.genero)}
            </Text>
          )}
          <Text className="text-neutral-500 text-sm">{perfil?.ciudad}</Text>
        </View>
      </View>

      <View className="px-6 gap-y-6 pb-10 pt-4">
        {/* Bio */}
        {perfil?.bio && (
          <Card>
            <Text className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
              Bio
            </Text>
            <Text className="text-neutral-700 leading-5">{perfil.bio}</Text>
          </Card>
        )}

        {/* Mis fotos */}
        <View className="gap-y-3">
          <Text className="text-lg font-bold text-neutral-900">Mis fotos</Text>
          <View className="flex-row flex-wrap gap-2">
            {perfil?.fotos?.map((foto) => (
              <Image
                key={foto.id}
                source={{ uri: foto.url }}
                className="w-[30%] aspect-[3/4] rounded-2xl"
                resizeMode="cover"
              />
            ))}
          </View>
          <TouchableOpacity>
            <Text className="text-primary text-sm font-medium">+ Agregar/editar fotos</Text>
          </TouchableOpacity>
        </View>

        {/* Mi dúo */}
        {miDuo && compañero && (
          <View className="gap-y-3">
            <Text className="text-lg font-bold text-neutral-900">Mi dúo</Text>
            <Card className="flex-row items-center gap-x-4">
              <Avatar
                uri={compañero.user.fotos?.[0]?.url}
                nombre={compañero.user.nombre}
                size="lg"
              />
              <View className="flex-1">
                <Text className="font-semibold text-neutral-900 text-lg">
                  {compañero.user.nombre}
                </Text>
                <Text className="text-neutral-500 text-sm">
                  {calcularEdad(compañero.user.fechaNacimiento)} años · {compañero.user.ciudad}
                </Text>
                <View className="flex-row items-center gap-x-1 mt-1">
                  <View className="w-2 h-2 rounded-full bg-success" />
                  <Text className="text-xs text-success font-medium">Dúo activo</Text>
                </View>
              </View>
            </Card>

            {miDuo.bioConjunta && (
              <Card>
                <Text className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
                  Bio del dúo
                </Text>
                <Text className="text-neutral-700 leading-5">{miDuo.bioConjunta}</Text>
              </Card>
            )}

            <Button
              label="Deshacer dúo"
              variant="outline"
              onPress={handleDeshacerDuo}
              fullWidth
              isLoading={deshacerDuo.isPending}
            />
          </View>
        )}

        {/* Acciones de cuenta */}
        <View className="gap-y-2 pt-4">
          <Button
            label="Cerrar sesión"
            variant="ghost"
            onPress={handleLogout}
            isLoading={logout.isPending}
            fullWidth
          />
        </View>
      </View>
    </ScrollView>
  );
}
