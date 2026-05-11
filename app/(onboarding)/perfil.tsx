import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/auth';
import { useMiPerfil } from '@/lib/queries/user';
import { useSubirFoto } from '@/lib/queries/user';
import { Button } from '@/components/ui/Button';
import { config } from '@/constants/config';

/**
 * Pantalla de onboarding para subir fotos del perfil individual.
 * El usuario debe subir al menos MIN_FOTOS fotos para continuar.
 */
export default function PerfilOnboardingScreen() {
  const { supabaseUser } = useAuthStore();
  const userId = supabaseUser?.id;

  const { data: perfil, isLoading } = useMiPerfil(userId);
  const subirFoto = useSubirFoto();

  const [subiendo, setSubiendo] = useState(false);

  const handleAgregarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para continuar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    if (!userId) return;
    setSubiendo(true);
    try {
      const orden = (perfil?.fotos?.length ?? 0) + 1;
      await subirFoto.mutateAsync({ userId, uri: result.assets[0].uri, orden });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo subir la foto. Intentá de nuevo.');
    } finally {
      setSubiendo(false);
    }
  };

  const fotosActuales = perfil?.fotos ?? [];
  const puedeAvanzar = fotosActuales.length >= config.MIN_FOTOS;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B47" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 24 }}
      >
        {/* Header */}
        <View className="gap-y-2 pt-8">
          <Text className="text-3xl font-black text-neutral-900">Tus fotos</Text>
          <Text className="text-neutral-500 text-base">
            Subí al menos {config.MIN_FOTOS} fotos para que otros dúos puedan verte.
          </Text>
        </View>

        {/* Grid de fotos */}
        <View className="flex-row flex-wrap gap-3">
          {Array.from({ length: config.MAX_FOTOS }).map((_, i) => {
            const foto = fotosActuales[i];
            return (
              <TouchableOpacity
                key={i}
                onPress={!foto ? handleAgregarFoto : undefined}
                className="w-[30%] aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border-2 border-dashed border-neutral-300 items-center justify-center"
              >
                {foto ? (
                  <Image source={{ uri: foto.url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center gap-y-1">
                    <Text className="text-3xl text-neutral-300">+</Text>
                    <Text className="text-xs text-neutral-400">
                      {i === 0 ? 'Principal' : `Foto ${i + 1}`}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {subiendo && (
          <View className="flex-row items-center gap-x-2 justify-center">
            <ActivityIndicator size="small" color="#FF6B47" />
            <Text className="text-neutral-500 text-sm">Subiendo foto...</Text>
          </View>
        )}

        {/* Info de cantidad */}
        <Text className="text-neutral-400 text-sm text-center">
          {fotosActuales.length} de {config.MIN_FOTOS} fotos mínimas{' '}
          {puedeAvanzar ? '✓' : ''}
        </Text>
      </ScrollView>

      {/* Botón continuar */}
      <View className="p-6 border-t border-neutral-100">
        <Button
          label={puedeAvanzar ? 'Continuar' : `Falta${config.MIN_FOTOS - fotosActuales.length > 1 ? 'n' : ''} ${config.MIN_FOTOS - fotosActuales.length} foto${config.MIN_FOTOS - fotosActuales.length > 1 ? 's' : ''}`}
          disabled={!puedeAvanzar}
          onPress={() => router.replace('/(onboarding)/linkear-duo')}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}
