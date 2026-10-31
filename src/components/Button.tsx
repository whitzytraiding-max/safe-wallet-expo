import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, loading, disabled, variant = 'primary', icon }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  return (
    <AnimatedPressable
      style={[styles.base, animStyle]}
      disabled={disabled || loading}
      onPressIn={() => { scale.value = withSpring(0.96, { mass: 0.3 }); }}
      onPressOut={() => { scale.value = withSpring(1, { mass: 0.3 }); }}
      onPress={handlePress}
    >
      <View style={[
        styles.inner,
        isPrimary && (disabled ? styles.primaryDisabled : styles.primary),
        isSecondary && styles.secondary,
        isDanger && styles.danger,
        isGhost && styles.ghost,
      ]}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? Colors.white : Colors.accent} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[
              styles.label,
              isPrimary && styles.labelWhite,
              isSecondary && styles.labelAccent,
              isDanger && styles.labelRed,
              isGhost && styles.labelMuted,
              icon ? styles.labelGap : null,
              disabled && styles.labelDisabled,
            ]}>
              {label}
            </Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.lg, overflow: 'hidden' },
  inner: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primary: { backgroundColor: Colors.accent },
  primaryDisabled: { backgroundColor: Colors.textMuted },
  secondary: {
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.lg,
  },
  danger: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: Colors.redDim,
    borderRadius: Radius.lg,
  },
  ghost: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  labelWhite: { color: Colors.white },
  labelAccent: { color: Colors.accent },
  labelRed: { color: Colors.red },
  labelMuted: { color: Colors.textSecondary },
  labelDisabled: { color: Colors.textSecondary },
  labelGap: { marginLeft: 8 },
});
