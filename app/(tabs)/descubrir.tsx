import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { useDuoStore } from '@/stores/duo';
import { useMiDuo } from '@/lib/queries/duo';
import { useDuosParaDescubrir, useRegistrarSwipe } from '@/lib/queries/swipe';
import { SwipeDeck } from '@/components/duo/SwipeDeck';
import type { DuoCard } from '@/types';

/**
 * Pestaña principal de descubrimiento.
 * Solo accesible si el usuario tiene un dúo activo (protegido en app/index.tsx).
 */
export default function DescubrirScreen() {
  const { supabaseUser, perfil } = useAuthStore();
  const { matchReciente, setMatchReciente } = useDuoStore();
  const userId = supabaseUser?.id ?? '';

  const { data: miDuo } = useMiDuo(userId);
  const registrarSwipe = useRegistrarSwipe();

  const {
    data: cards,
    isLoading,
    refetch,
  } = useDuosParaDescubrir({
    miDuoId: miDuo?.id ?? '',
    ciudad: perfil?.ciudad ?? '',
    userId,
  });

  const handleSwipeRight = async (card: DuoCard) => {
    if (!miDuo) return;
    const result = await registrarSwipe.mutateAsync({
      swiperUserId: userId,
      swiperDuoId: miDuo.id,
      targetDuoId: card.duo.id,
      direccion: 'RIGHT',
    });

    if (result.match && result.matchId) {
      setMatchReciente(result.matchId);
    }
  };

  const handleSwipeLeft = async (card: DuoCard) => {
    if (!miDuo) return;
    await registrarSwipe.mutateAsync({
      swiperUserId: userId,
      swiperDuoId: miDuo.id,
      targetDuoId: card.duo.id,
      direccion: 'LEFT',
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color="#FF6B47" />
        <Text className="text-neutral-400 mt-4">Buscando dúos cerca tuyo...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <Text className="text-3xl font-black text-neutral-900">Descubrir</Text>
        <Text className="text-neutral-400 text-sm">Swipeá dúos cerca tuyo</Text>
      </View>

      {/* Deck de swipe */}
      <View className="flex-1">
        <SwipeDeck
          cards={cards ?? []}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onEmpty={refetch}
        />
      </View>

      {/* Modal de Match */}
      <Modal visible={!!matchReciente} transparent animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center px-8">
          <View className="bg-white rounded-3xl p-8 items-center gap-y-4 w-full">
            <Text className="text-6xl">🎉</Text>
            <Text className="text-3xl font-black text-neutral-900 text-center">
              ¡Es un Match!
            </Text>
            <Text className="text-neutral-500 text-center text-base">
              Los cuatro se gustaron. Ya pueden empezar a chatear.
            </Text>
            <TouchableOpacity
              onPress={() => setMatchReciente(null)}
              className="bg-primary rounded-2xl px-8 py-4 w-full items-center"
            >
              <Text className="text-white font-bold text-lg">Ir al chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatchReciente(null)}>
              <Text className="text-neutral-400 text-sm">Seguir descubriendo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
