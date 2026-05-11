import React, { forwardRef } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, className, ...props },
  ref,
) {
  return (
    <View className="w-full gap-y-1">
      {label && (
        <Text className="text-sm font-medium text-neutral-700">{label}</Text>
      )}
      <TextInput
        ref={ref}
        className={`w-full border rounded-xl px-4 py-3 text-base text-neutral-900 bg-white ${
          error ? 'border-error' : 'border-neutral-300'
        } focus:border-primary ${className ?? ''}`}
        placeholderTextColor="#A8A8A0"
        {...props}
      />
      {error && <Text className="text-xs text-error">{error}</Text>}
      {!error && hint && <Text className="text-xs text-neutral-400">{hint}</Text>}
    </View>
  );
});
