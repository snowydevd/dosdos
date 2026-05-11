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

/**
 * Lista de chats activos (re-usa los datos de matches con su chat asociado).
 */
function ChatItem({ match, miDuoId }: { match: MatchWithChat; miDuoId: string }) {
  const otroDuo = match.duoAId === miDuoId ? match.duoB : match.duoA;
  const fotos = otroDuo.miembros.flatMap((m) => m.user.fotos ?? []);
  const foto1 = fotos[0]?.url;
  const foto2 = fotos[1]?.url ?? foto1;
  const nombres = otroDuo.miembros.map((m) => m.user.nombre).join(' & ');

  return (
    <TouchableOpacity
      onPress={() => match.chat && router.push(`/chat/${match.chat.id}`)}
      className="flex-row items-center px-6 py-4 gap-x-4 border-b border-neutral-100"
      activeOpacity={0.7}
    >
      {/* Fotos solapadas */}
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

      <View className="flex-1">
        <Text className="font-semibold text-neutral-900">{nombres}</Text>
        {match.ultimoMensaje ? (
          <Text className="text-sm text-neutral-500">
            {truncar(match.ultimoMensaje.contenido, 50)}
          </Text>
        ) : (
          <Text className="text-sm text-primary italic">Match nuevo — ¡deciles hola!</Text>
        )}
      </View>

      {match.ultimoMensaje && (
        <Text className="text-xs text-neutral-400">
          {formatearHoraChat(match.ultimoMensaje.createdAt)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function ChatListScreen() {
  const { supabaseUser } = useAuthStore();
  const userId = supabaseUser?.id ?? '';

  const { data: miDuo } = useMiDuo(userId);
  const { data: matches, isLoading } = useMisMatches(miDuo?.id);

  const chatsActivos = (matches ?? []).filter((m) => !!m.chat);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B47" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-14 pb-4 border-b border-neutral-100">
        <Text className="text-3xl font-black text-neutral-900">Chats</Text>
        <Text className="text-neutral-400 text-sm">Conversaciones con tus matches</Text>
      </View>

      {!chatsActivos.length ? (
        <View className="flex-1 items-center justify-center gap-y-3 px-8">
          <Text className="text-5xl">💬</Text>
          <Text className="text-xl font-bold text-neutral-900 text-center">
            Nada por acá todavía
          </Text>
          <Text className="text-neutral-500 text-center">
            Los chats aparecen cuando los cuatro se dan like.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatsActivos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem match={item} miDuoId={miDuo?.id ?? ''} />
          )}
        />
      )}
    </View>
  );
}
