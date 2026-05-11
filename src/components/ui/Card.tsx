import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ padding = 'md', shadow = true, className, children, ...props }: CardProps) {
  return (
    <View
      {...props}
      className={`bg-white rounded-2xl ${paddingMap[padding]} ${
        shadow ? 'shadow-sm' : ''
      } ${className ?? ''}`}
    >
      {children}
    </View>
  );
}
