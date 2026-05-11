import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: {
    container: 'bg-primary active:bg-primary-600',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-neutral-800 active:bg-neutral-900',
    text: 'text-white font-semibold',
  },
  outline: {
    container: 'border-2 border-primary bg-transparent active:bg-primary-50',
    text: 'text-primary font-semibold',
  },
  ghost: {
    container: 'bg-transparent active:bg-neutral-100',
    text: 'text-neutral-700 font-medium',
  },
  danger: {
    container: 'bg-error active:bg-red-600',
    text: 'text-white font-semibold',
  },
};

const sizeStyles = {
  sm: { container: 'px-4 py-2 rounded-xl', text: 'text-sm' },
  md: { container: 'px-6 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-8 py-4 rounded-2xl', text: 'text-lg' },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={`${v.container} ${s.container} ${fullWidth ? 'w-full' : ''} ${
        isDisabled ? 'opacity-50' : ''
      } flex-row items-center justify-center ${className ?? ''}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#FF6B47' : '#ffffff'} />
      ) : (
        <Text className={`${v.text} ${s.text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
