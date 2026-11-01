import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useWallet } from '../store/wallet';
import { Button } from '../components/Button';
import { WalletLogo } from '../components/WalletLogo';
import { Colors, Spacing, Radius } from '../theme';

/* ─── Face ID overlay ──────────────────────────────────────────────── */
function FaceIDOverlay() {
  const frameOp = useSharedValue(0);
  const scanY = useSharedValue(0);
  const scanOp = useSharedValue(0);
  const scanningTextOp = useSharedValue(1);
  const checkOp = useSharedValue(0);
  const checkScale = useSharedValue(0.3);
  const badgeOp = useSharedValue(0);
  const badgeY = useSharedValue(12);
  const pulse1Op = useSharedValue(0.5);
  const pulse1Scale = useSharedValue(1);
  const pulse2Op = useSharedValue(0.35);
  const pulse2Scale = useSharedValue(1);

  useEffect(() => {
    frameOp.value = withTiming(1, { duration: 350 });

    const t1 = setTimeout(() => {
      scanOp.value = withTiming(1, { duration: 180 });
      scanY.value = withTiming(160, { duration: 1400, easing: Easing.inOut(Easing.ease) });
    }, 400);

    const t2 = setTimeout(() => {
      pulse1Op.value = withTiming(0, { duration: 700 });
      pulse1Scale.value = withTiming(1.6, { duration: 700 });
    }, 600);

    const t3 = setTimeout(() => {
      pulse2Op.value = withTiming(0, { duration: 700 });
      pulse2Scale.value = withTiming(1.6, { duration: 700 });
    }, 900);

    const t4 = setTimeout(() => {
      scanOp.value = withTiming(0, { duration: 200 });
      scanningTextOp.value = withTiming(0, { duration: 200 });
      checkOp.value = withDelay(150, withTiming(1, { duration: 300 }));
      checkScale.value = withDelay(150, withSpring(1, { damping: 11, stiffness: 180 }));
    }, 1900);

    const t5 = setTimeout(() => {
      badgeOp.value = withTiming(1, { duration: 350 });
      badgeY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) });
    }, 2350);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: frameOp.value }));
  const scanStyle = useAnimatedStyle(() => ({ opacity: scanOp.value, transform: [{ translateY: scanY.value }] }));
  const scanTextStyle = useAnimatedStyle(() => ({ opacity: scanningTextOp.value }));
  const checkStyle = useAnimatedStyle(() => ({ opacity: checkOp.value, transform: [{ scale: checkScale.value }] }));
  const badgeStyle = useAnimatedStyle(() => ({ opacity: badgeOp.value, transform: [{ translateY: badgeY.value }] }));
  const pulse1Style = useAnimatedStyle(() => ({ opacity: pulse1Op.value, transform: [{ scale: pulse1Scale.value }] }));
  const pulse2Style = useAnimatedStyle(() => ({ opacity: pulse2Op.value, transform: [{ scale: pulse2Scale.value }] }));

  return (
    <Animated.View style={[overlay.container, overlayStyle]}>
      <View style={overlay.inner}>
        <View style={overlay.frameOuter}>
          <Animated.View style={[overlay.pulseRing, pulse1Style]} />
          <Animated.View style={[overlay.pulseRing, pulse2Style]} />
          <View style={[overlay.corner, overlay.cornerTL]} />
          <View style={[overlay.corner, overlay.cornerTR]} />
          <View style={[overlay.corner, overlay.cornerBL]} />
          <View style={[overlay.corner, overlay.cornerBR]} />
          <View style={overlay.faceDots}>
            <View style={overlay.eyeRow}>
              <View style={overlay.eye} />
              <View style={overlay.eye} />
            </View>
            <View style={overlay.nose} />
            <View style={overlay.mouth} />
          </View>
          <Animated.View style={[overlay.scanLine, scanStyle]} />
          <Animated.View style={[overlay.checkWrap, checkStyle]}>
            <Text style={overlay.checkText}>✓</Text>
          </Animated.View>
        </View>
        <Animated.Text style={[overlay.scanningText, scanTextStyle]}>
          Look at iPhone to authenticate
        </Animated.Text>
        <Animated.View style={[overlay.securedBadge, badgeStyle]}>
          <Text style={overlay.lockIcon}>🔒</Text>
          <Text style={overlay.securedText}>Passkey Secured</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/* ─── Main onboarding screen ───────────────────────────────────────── */
export default function Onboarding() {
  const router = useRouter();
  const { createWallet, isCreating, stage } = useWallet();
  const [showBiometric, setShowBiometric] = useState(false);

  const logoOp = useSharedValue(0);
  const logoY = useSharedValue(24);
  const titleOp = useSharedValue(0);
  const titleY = useSharedValue(16);
  const btnOp = useSharedValue(0);
  const btnY = useSharedValue(16);

  useEffect(() => {
    logoOp.value = withDelay(100, withTiming(1, { duration: 700 }));
    logoY.value = withDelay(100, withSpring(0, { damping: 22, stiffness: 140 }));
    titleOp.value = withDelay(380, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(380, withSpring(0, { damping: 24, stiffness: 160 }));
    btnOp.value = withDelay(700, withTiming(1, { duration: 500 }));
    btnY.value = withDelay(700, withSpring(0, { damping: 26, stiffness: 180 }));
  }, []);

  useEffect(() => {
    if (stage === 'unlocked') router.replace('/(tabs)');
  }, [stage]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOp.value,
    transform: [{ translateY: logoY.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ translateY: titleY.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOp.value,
    transform: [{ translateY: btnY.value }],
  }));

  const handleCreate = async () => {
    setShowBiometric(true);
    try {
      await createWallet();
    } catch (e: any) {
      setShowBiometric(false);
      if (!e?.message?.includes('cancel')) {
        Alert.alert('Error', e?.message ?? 'Something went wrong');
      }
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Hero area */}
        <View style={styles.heroArea}>
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <View style={styles.logoShell}>
              <WalletLogo size={96} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.titleWrap, titleStyle]}>
            <Text style={styles.title}>Safe Wallet</Text>
            <Text style={styles.tagline}>Your keys. Your crypto.</Text>
          </Animated.View>
        </View>

        {/* CTA area */}
        <Animated.View style={[styles.ctaArea, btnStyle]}>
          <Button
            label={isCreating ? 'Authenticating…' : 'Create Wallet with Face ID'}
            onPress={handleCreate}
            loading={isCreating && !showBiometric}
          />
          <Text style={styles.legal}>
            Non-custodial · Passkey secured · Arbitrum
          </Text>
        </Animated.View>

        {/* Compozy footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Text style={styles.footerLogoText}>C</Text>
          </View>
          <Text style={styles.footerText}>Powered by Compozy Finance</Text>
        </View>
      </SafeAreaView>

      {showBiometric && <FaceIDOverlay />}
    </View>
  );
}

/* ─── Overlay styles ─────────────────────────────────────────────────── */
const FRAME_SIZE = 180;
const CORNER_SIZE = 28;
const BORDER_W = 3;

const overlay = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  inner: { alignItems: 'center', gap: 28 },
  frameOuter: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: FRAME_SIZE / 2,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.accent,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: BORDER_W, borderLeftWidth: BORDER_W },
  cornerTR: { top: 0, right: 0, borderTopWidth: BORDER_W, borderRightWidth: BORDER_W },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: BORDER_W, borderLeftWidth: BORDER_W },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: BORDER_W, borderRightWidth: BORDER_W },
  faceDots: { alignItems: 'center', gap: 10 },
  eyeRow: { flexDirection: 'row', gap: 28 },
  eye: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  nose: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  mouth: { width: 24, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  scanLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  checkWrap: {
    position: 'absolute',
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentDim,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 28, color: Colors.accent, fontWeight: '700' },
  scanningText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '500', textAlign: 'center' },
  securedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  lockIcon: { fontSize: 16 },
  securedText: { color: Colors.accent, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});

/* ─── Screen styles ──────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },

  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },

  logoWrap: { alignItems: 'center' },
  logoShell: {
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: Colors.accentDim,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleWrap: { alignItems: 'center', gap: 10 },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    color: Colors.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  ctaArea: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  legal: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingBottom: Spacing.lg,
  },
  footerLogo: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogoText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
