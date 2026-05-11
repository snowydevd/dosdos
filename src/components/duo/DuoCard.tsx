import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import type { DuoCard as DuoCardType } from '@/types';
import { calcularEdad } from '@/lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DuoCardProps {
  card: DuoCardType;
}

/**
 * Card que se muestra en el deck de swipe.
 * Muestra fotos alternadas de los 2 miembros + info del dúo.
 */
export function DuoCard({ card }: DuoCardProps) {
  const { duo, miembro1, miembro2 } = card;
  const [fotoIndex, setFotoIndex] = useState(0);

  // Intercalamos fotos de miembro1 y miembro2 para mostrar el dúo
  const todasLasFotos = [
    ...(miembro1.fotos.map((f) => ({ ...f, miembro: miembro1 }))),
    ...(miembro2.fotos.map((f) => ({ ...f, miembro: miembro2 }))),
  ].sort((a, b) => a.orden - b.orden);

  const fotoActual = todasLasFotos[fotoIndex];

  const avanzarFoto = () => {
    if (fotoIndex < todasLasFotos.length - 1) setFotoIndex(fotoIndex + 1);
  };
  const retrocederFoto = () => {
    if (fotoIndex > 0) setFotoIndex(fotoIndex - 1);
  };

  return (
    <View
      className="bg-white rounded-3xl overflow-hidden shadow-lg"
      style={{ width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH * 1.35 }}
    >
      {/* Foto principal */}
      <View className="flex-1 relative">
        {fotoActual ? (
          <Image
            source={{ uri: fotoActual.url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-neutral-200 items-center justify-center">
            <Text className="text-neutral-400 text-4xl">📸</Text>
          </View>
        )}

        {/* Navegación de fotos (tap izq/der) */}
        <View className="absolute inset-0 flex-row">
          <TouchableOpacity className="flex-1" onPress={retrocederFoto} activeOpacity={1} />
          <TouchableOpacity className="flex-1" onPress={avanzarFoto} activeOpacity={1} />
        </View>

        {/* Indicador de fotos */}
        <View className="absolute top-3 left-3 right-3 flex-row gap-1">
          {todasLasFotos.map((_, i) => (
            <View
              key={i}
              className={`flex-1 h-1 rounded-full ${i === fotoIndex ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </View>

        {/* Badge del miembro activo */}
        {fotoActual && (
          <View className="absolute bottom-4 left-4 bg-black/40 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-medium">
              {fotoActual.miembro.nombre}, {calcularEdad(fotoActual.miembro.fechaNacimiento)}
            </Text>
          </View>
        )}
      </View>

      {/* Información del dúo */}
      <View className="p-4 gap-y-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-neutral-900">
            {miembro1.nombre} & {miembro2.nombre}
          </Text>
          <Text className="text-neutral-500 text-sm">
            {calcularEdad(miembro1.fechaNacimiento)} · {calcularEdad(miembro2.fechaNacimiento)}
          </Text>
        </View>

        <Text className="text-neutral-500 text-sm">{miembro1.ciudad}</Text>

        {duo.bioConjunta && (
          <Text className="text-neutral-700 text-sm leading-5" numberOfLines={2}>
            {duo.bioConjunta}
          </Text>
        )}
      </View>
    </View>
  );
}
