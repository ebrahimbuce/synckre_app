import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

type AutoGrowingInputProps = TextInputProps & {
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onChangeText?: (text: string) => void;
  value?: string;
  className?: string;
};

const AutoGrowingInput = ({
  placeholder = 'Escribe aquí...',
  minHeight = 48,
  maxHeight = 150,
  onChangeText,
  value,
  className = '',
  ...props
}: AutoGrowingInputProps) => {
  return (
    <TextInput
      className={`flex w-full flex-row text-base text-foreground ${className}`}
      placeholder={placeholder}
      placeholderTextColor="#999"
      multiline
      textAlignVertical="top"
      onChangeText={onChangeText}
      value={value}
      style={{ minHeight, maxHeight }}
      {...props}
    />
  );
};

export { AutoGrowingInput };
