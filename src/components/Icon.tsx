import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';

interface Props {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 24, color, style }: Props) {
  return (
    <SymbolView
      name={name as any}
      style={[{ width: size, height: size }, style]}
      type="hierarchical"
      tintColor={color}
    />
  );
}
