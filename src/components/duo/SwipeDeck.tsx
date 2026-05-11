import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import type { DuoCard } from '@/types';
import { DuoCard as DuoCardComponent } from './DuoCard';

interface SwipeDeckProps {
  cards: DuoCard[];
  onSwipeRight: (card: DuoCard) => void;
  onSwipeLeft: (card: DuoCard) => void;
  onEmpty?: () => void;
}

/**
 * Deck de swipe para descubrir dúos.
 *
 * Usamos react-native-deck-swiper por su API simple y buen soporte de gestos.
 * Alternativa evaluada: react-native-swiper-flatlist (más mantenida pero
 * pensada para carousels, no swipe de cards tipo Tinder).
 */
export function SwipeDeck({ cards, onSwipeRight, onSwipeLeft, onEmpty }: SwipeDeckProps) {
  const swiperRef = useRef<Swiper<DuoCard>>(null);

  if (cards.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-y-4 px-8">
        <Text className="text-6xl">🎉</Text>
        <Text className="text-2xl font-bold text-neutral-900 text-center">
          ¡Ya viste todos!
        </Text>
        <Text className="text-neutral-500 text-center">
          Volvé más tarde para ver nuevos dúos cerca tuyo.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Swiper
        ref={swiperRef}
        cards={cards}
        renderCard={(card) => (card ? <DuoCardComponent card={card} /> : null)}
        onSwipedRight={(index) => onSwipeRight(cards[index])}
        onSwipedLeft={(index) => onSwipeLeft(cards[index])}
        onSwipedAll={onEmpty}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        stackSeparation={10}
        stackScale={4}
        animateCardOpacity
        swipeAnimationDuration={350}
        overlayLabels={{
          left: {
            title: 'NOPE',
            style: {
              label: {
                backgroundColor: '#EF4444',
                borderColor: '#EF4444',
                color: 'white',
                borderWidth: 1,
                fontSize: 24,
                fontWeight: '700',
                padding: 8,
                borderRadius: 8,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 24,
                marginLeft: -16,
              },
            },
          },
          right: {
            title: '¡ME GUSTA!',
            style: {
              label: {
                backgroundColor: '#FF6B47',
                borderColor: '#FF6B47',
                color: 'white',
                borderWidth: 1,
                fontSize: 24,
                fontWeight: '700',
                padding: 8,
                borderRadius: 8,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 24,
                marginLeft: 16,
              },
            },
          },
        }}
      />

      {/* Botones manuales de nope/like */}
      <View className="flex-row justify-center gap-x-8 pb-8 pt-2">
        <TouchableOpacity
          onPress={() => swiperRef.current?.swipeLeft()}
          className="w-14 h-14 rounded-full bg-white shadow-md items-center justify-center border border-neutral-200"
        >
          <Text className="text-2xl">✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swiperRef.current?.swipeRight()}
          className="w-16 h-16 rounded-full bg-primary shadow-md items-center justify-center"
        >
          <Text className="text-3xl">♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
