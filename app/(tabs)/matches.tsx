import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useMiDuo } from '@/lib/queries/duo';
import { useMisMatches } from '@/lib/queries/chat';
import type { MatchWithChat } from '@/types';
import { formatearHoraChat, truncar } from '@/lib/utils';

function MatchItem({ match, miDuoId }: { match: MatchWithChat; miDuoId: string }) {
  // El otro dúo (no el nuestro)
  const otroDuo = match.duoAId === miDuoId ? match.duoB : match.duoA;
  const fotos = otroDuo.miembros.flatMap((m) => m.user.fotos ?? []);
  const foto1 = fotos[0]?.url;
  const foto2 = fotos[1]?.url ?? foto1;

  const nombres = otroDuo.miembros.map((m) => m.user.nombre).join(' & ');

  return (
    <TouchableOpacity
      onPress={() => match.chat && router.push(`/chat/${match.chat.id}`)}
      className="flex-row items-center px-6 py-4 gap-x-4 border-b border-neutral-100"
    >
      {/* Fotos solapadas del otro dúo */}
      <View className="relative w-14 h-12">
        {foto2 && (
          <Image
            source={{ uri: foto2 }}
            className="absolute right-0 bottom-0 w-10 h-10 rounded-full border-2 border-white"
            resizeMode="cover"
          />
        )}
        {foto1 && (
          <Image
            source={{ uri: foto1 }}
            className="absolute left-0 top-0 w-10 h-10 rounded-full border-2 border-white"
            resizeMode="cover"
          />
        )}
      </View>

      {/* Nombre + último mensaje */}
      <View className="flex-1">
        <Text className="font-semibold text-neutral-900">{nombres}</Text>
        {match.ultimoMensaje ? (
          <Text className="text-sm text-neutral-500">
            {truncar(match.ultimoMensaje.contenido, 45)}
          </Text>
        ) : (
          <Text className="text-sm text-primary italic">¡Digan hola! 👋</Text>
        )}
      </View>

      {/* Hora */}
      {match.ultimoMensaje && (
        <Text className="text-xs text-neutral-400">
          {formatearHoraChat(match.ultimoMensaje.createdAt)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const { supabaseUser } = useAuthStore();
  const userId = supabaseUser?.id ?? '';

  const { data: miDuo } = useMiDuo(userId);
  const { data: matches, isLoading } = useMisMatches(miDuo?.id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B47" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 border-b border-neutral-100">
        <Text className="text-3xl font-black text-neutral-900">Matches</Text>
        <Text className="text-neutral-400 text-sm">
          {matches?.length ?? 0} dúos que les gustaron a los cuatro
        </Text>
      </View>

      {!matches?.length ? (
        <View className="flex-1 items-center justify-center gap-y-3 px-8">
          <Text className="text-5xl">💘</Text>
          <Text className="text-xl font-bold text-neutral-900 text-center">
            Todavía no tienen matches
          </Text>
          <Text className="text-neutral-500 text-center">
            Seguí swipeando dúos en la pestaña Descubrir.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchItem match={item} miDuoId={miDuo?.id ?? ''} />
          )}
        />
      )}
    </View>
  );
}
