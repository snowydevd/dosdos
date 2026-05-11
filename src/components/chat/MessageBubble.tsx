import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { Message } from '@/types';
import { formatearHoraChat } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const fotoUrl = message.sender.fotos?.[0]?.url;

  return (
    <View className={`flex-row items-end gap-x-2 mb-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar del remitente (solo en mensajes ajenos) */}
      {!isOwn && showAvatar && (
        <Avatar uri={fotoUrl} nombre={message.sender.nombre} size="sm" />
      )}
      {!isOwn && !showAvatar && <View className="w-8" />}

      <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Nombre (solo mensajes ajenos, primera burbuja del grupo) */}
        {!isOwn && showAvatar && (
          <Text className="text-xs text-neutral-500 mb-1 ml-1">{message.sender.nombre}</Text>
        )}

        <View
          className={`px-4 py-3 rounded-2xl ${
            isOwn
              ? 'bg-primary rounded-br-sm'
              : 'bg-neutral-100 rounded-bl-sm'
          }`}
        >
          <Text className={`text-sm leading-5 ${isOwn ? 'text-white' : 'text-neutral-900'}`}>
            {message.contenido}
          </Text>
        </View>

        <Text className="text-xs text-neutral-400 mt-1 mx-1">
          {formatearHoraChat(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}
