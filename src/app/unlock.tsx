import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useWallet } from '../store/wallet';
import { Colors, Spacing, Radius } from '../theme';

export default function Unlock() {
  const router = useRouter();
  const { unlock, isUnlocking, stage } = useWallet();
  const hasAutoTriggered = useRef(false);

  // Entrance
  const logoOp = useSharedValue(0);
  const logoY = useSharedValue(-12);
  const shieldScale = useSharedValue(0.75);
  const shieldOp = useSharedValue(0);
  const hintOp = useSharedValue(0);

  // Breathing idle animation on shield
  const breathScale = useSharedValue(1);
  const ringScale = useSharedValue(0.6);
  const ringOp = useSharedValue(0);

  // Shake on failure
  const shakeX = useSharedValue(0);

  useEffect(() => {
    logoOp.value = withTiming(1, { duration: 500 });
    logoY.value = withSpring(0, { damping: 22, stiffness: 180 });
    shieldOp.value = withDelay(200, withTiming(1, { duration: 550 }));
    shieldScale.value = withDelay(200, withSpring(1, { damping: 18, stiffness: 140 }));
    hintOp.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Idle breathing
    const breathTimer = setTimeout(() => {
      breathScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }, 900);

    // Ring idle pulse
    const ringTimer = setTimeout(() => {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 0 }),
          withTiming(1.5, { duration: 2400, easing: Easing.out(Easing.exp) }),
        ),
        -1,
        false,
      );
      ringOp.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(0, { duration: 2400, easing: Easing.out(Easing.exp) }),
        ),
        -1,
        false,
      );
    }, 1000);

    const autoTimer = setTimeout(() => {
      if (!hasAutoTriggered.current) {
        hasAutoTriggered.current = true;
        handleUnlock();
      }
    }, 900);

    return () => {
      clearTimeout(breathTimer);
      clearTimeout(ringTimer);
      clearTimeout(autoTimer);
    };
  }, []);

  useEffect(() => {
    if (stage === 'unlocked') router.replace('/(tabs)');
  }, [stage]);

  const handleUnlock = async () => {
    cancelAnimation(breathScale);
    breathScale.value = withTiming(1.08, { duration: 200 });
    try {
      await unlock();
      breathScale.value = withSpring(1, { damping: 15 });
    } catch (e: any) {
      breathScale.value = withSpring(1, { damping: 15 });
      shakeX.value = withSequence(
        withTiming(-12, { duration: 55 }),
        withTiming(12, { duration: 55 }),
        withTiming(-8, { duration: 55 }),
        withTiming(8, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      );
    }
  };

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOp.value,
    transform: [{ translateY: logoY.value }],
  }));
  const shieldStyle = useAnimatedStyle(() => ({
    opacity: shieldOp.value,
    transform: [
      { scale: shieldScale.value * breathScale.value },
      { translateX: shakeX.value },
    ],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOp.value,
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOp.value }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>

        {/* Logo */}
        <Animated.View style={[styles.logoRow, logoStyle]}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>SW</Text>
          </View>
          <Text style={styles.appName}>Safe Wallet</Text>
        </Animated.View>

        {/* Shield + ring */}
        <View style={styles.centerArea}>
          <Animated.View style={[styles.ringOuter, ringStyle]} />
          <Pressable onPress={handleUnlock} disabled={isUnlocking}>
            <Animated.View style={[styles.shieldWrap, shieldStyle]}>
              <View style={styles.shieldBg}>
                <SymbolView
                  name={isUnlocking ? 'faceid' : 'lock.shield.fill'}
                  size={56}
                  tintColor={isUnlocking ? Colors.green : Colors.accent}
                />
              </View>
            </Animated.View>
          </Pressable>
        </View>

        {/* Hint */}
        <Animated.View style={[styles.hintArea, hintStyle]}>
          <Text style={styles.hintTitle}>
            {isUnlocking ? 'Authenticating…' : 'Tap to unlock'}
          </Text>
          <View style={styles.faceIdRow}>
            <SymbolView name="faceid" size={16} tintColor={Colors.textMuted} />
            <Text style={styles.hintSub}>Face ID</Text>
          </View>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const SHIELD_SIZE = 130;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  appName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },

  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: SHIELD_SIZE + 80,
    height: SHIELD_SIZE + 80,
    borderRadius: (SHIELD_SIZE + 80) / 2,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  shieldWrap: {
    width: SHIELD_SIZE,
    height: SHIELD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBg: {
    width: SHIELD_SIZE,
    height: SHIELD_SIZE,
    borderRadius: SHIELD_SIZE / 2,
    backgroundColor: Colors.accentDim,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hintArea: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl + Spacing.xl,
  },
  hintTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '600' },
  faceIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintSub: { color: Colors.textMuted, fontSize: 14 },
});
