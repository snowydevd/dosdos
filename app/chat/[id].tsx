import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import {
  useMensajesChat,
  useChatRealtime,
  useEnviarMensaje,
  useMarcarMensajesLeidos,
} from '@/lib/queries/chat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import type { Message } from '@/types';

/**
 * Chat grupal de 4 personas en tiempo real.
 * Se suscribe a Supabase Realtime y actualiza el caché de React Query
 * cuando llegan nuevos mensajes.
 */
export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const { supabaseUser } = useAuthStore();
  const userId = supabaseUser?.id ?? '';

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMensajesChat(chatId);
  const enviarMensaje = useEnviarMensaje();
  const marcarLeidos = useMarcarMensajesLeidos();

  // Realtime — escucha nuevos mensajes
  useChatRealtime(chatId);

  const flatListRef = useRef<FlatList<Message>>(null);

  // Marcar mensajes como leídos al entrar al chat
  useEffect(() => {
    if (chatId && userId) {
      marcarLeidos.mutate({ chatId, userId });
    }
  }, [chatId, userId]);

  const mensajes: Message[] = (data?.pages ?? []).flatMap((p) => p.mensajes);

  const handleEnviar = async (texto: string) => {
    if (!chatId) return;
    await enviarMensaje.mutateAsync({ chatId, senderId: userId, contenido: texto });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B47" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Header */}
      <View className="flex-row items-center gap-x-3 px-4 pt-14 pb-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <View>
          <Text className="font-bold text-neutral-900 text-lg">Chat grupal</Text>
          <Text className="text-xs text-neutral-400">4 personas en el chat</Text>
        </View>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isOwn = item.senderId === userId;
          const prevMsg = mensajes[index + 1];
          const showAvatar = !prevMsg || prevMsg.senderId !== item.senderId;
          return (
            <MessageBubble
              message={item}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          );
        }}
        inverted
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#FF6B47" style={{ margin: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 gap-y-2">
            <Text className="text-4xl">👋</Text>
            <Text className="text-neutral-400 text-sm">¡Rompan el hielo! Son los primeros en chatear.</Text>
          </View>
        }
      />

      {/* Input de mensaje */}
      <ChatInput onSend={handleEnviar} isLoading={enviarMensaje.isPending} />
    </KeyboardAvoidingView>
  );
}
