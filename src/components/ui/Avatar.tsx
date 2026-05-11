import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarProps {
  uri?: string;
  nombre?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-12 h-12', text: 'text-sm' },
  lg: { container: 'w-16 h-16', text: 'text-lg' },
  xl: { container: 'w-24 h-24', text: 'text-2xl' },
};

export function Avatar({ uri, nombre, size = 'md', className }: AvatarProps) {
  const s = sizeMap[size];
  const inicial = nombre?.charAt(0).toUpperCase() ?? '?';

  return (
    <View
      className={`${s.container} rounded-full overflow-hidden items-center justify-center bg-primary-100 ${className ?? ''}`}
    >
      {uri ? (
        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <Text className={`${s.text} font-bold text-primary`}>{inicial}</Text>
      )}
    </View>
  );
}
