import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface ChatInputProps {
  onSend: (texto: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = 'Escribí un mensaje...',
}: ChatInputProps) {
  const [texto, setTexto] = useState('');

  const handleSend = () => {
    const trimmed = texto.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setTexto('');
  };

  return (
    <View className="flex-row items-end gap-x-2 px-4 py-3 bg-white border-t border-neutral-200">
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder={placeholder}
        placeholderTextColor="#A8A8A0"
        multiline
        maxLength={1000}
        className="flex-1 bg-neutral-100 rounded-2xl px-4 py-3 text-base text-neutral-900 max-h-28"
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!texto.trim() || isLoading}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          texto.trim() ? 'bg-primary' : 'bg-neutral-300'
        }`}
      >
        <Text className="text-white text-lg">↑</Text>
      </TouchableOpacity>
    </View>
  );
}
