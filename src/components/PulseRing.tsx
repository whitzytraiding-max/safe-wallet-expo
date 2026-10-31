import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../theme';

interface Props {
  size: number;
  color?: string;
  count?: number;
}

function Ring({ size, color, delay }: { size: number; color: string; delay: number }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(withTiming(1.6, { duration: 2000, easing: Easing.out(Easing.exp) }), -1, false));
    opacity.value = withDelay(delay, withRepeat(withTiming(0, { duration: 2000, easing: Easing.out(Easing.exp) }), -1, false));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          position: 'absolute',
        },
      ]}
    />
  );
}

export function PulseRing({ size, color = Colors.green, count = 3 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Ring key={i} size={size} color={color} delay={i * 600} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 1.5,
  },
});
