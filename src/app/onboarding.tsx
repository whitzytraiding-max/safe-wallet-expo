import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useWallet } from '../store/wallet';
import { Button } from '../components/Button';
import { Colors, Spacing, Radius } from '../theme';

const FEATURES = [
  {
    symbol: 'faceid',
    title: 'No seed phrase',
    desc: 'Your biometrics are your key. Nothing to write down or lose.',
    color: Colors.accent,
  },
  {
    symbol: 'shield.fill',
    title: 'Safe smart account',
    desc: 'Battle-tested Gnosis Safe — the gold standard in crypto security.',
    color: '#22C55E',
  },
  {
    symbol: 'bolt.fill',
    title: 'Arbitrum powered',
    desc: 'Fast, low-cost transactions on Ethereum Layer 2.',
    color: '#F59E0B',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { createWallet, isCreating, stage } = useWallet();

  const headerOp = useSharedValue(0);
  const headerY = useSharedValue(20);
  const titleOp = useSharedValue(0);
  const featOp = useSharedValue(0);
  const btnOp = useSharedValue(0);

  useEffect(() => {
    headerOp.value = withDelay(80, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(80, withSpring(0, { damping: 22, stiffness: 160 }));
    titleOp.value = withDelay(350, withTiming(1, { duration: 550 }));
    featOp.value = withDelay(580, withTiming(1, { duration: 550 }));
    btnOp.value = withDelay(800, withTiming(1, { duration: 450 }));
  }, []);

  useEffect(() => {
    if (stage === 'unlocked') router.replace('/(tabs)');
  }, [stage]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value }));
  const featStyle = useAnimatedStyle(() => ({ opacity: featOp.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOp.value }));

  const handleCreate = async () => {
    try {
      await createWallet();
    } catch (e: any) {
      if (!e?.message?.includes('cancel')) {
        Alert.alert('Error', e?.message ?? 'Something went wrong');
      }
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo header */}
          <Animated.View style={[styles.logoArea, headerStyle]}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>SW</Text>
            </View>
            <View style={styles.shieldWrap}>
              <SymbolView
                name="lock.shield.fill"
                size={72}
                tintColor={Colors.accent}
              />
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View style={[styles.titleWrap, titleStyle]}>
            <Text style={styles.title}>Safe Wallet</Text>
            <Text style={styles.subtitle}>
              Self-custodial smart wallet secured by your biometrics.{'\n'}
              No seed phrase. No custodian.
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View style={[styles.features, featStyle]}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
                  <SymbolView
                    name={f.symbol as any}
                    size={22}
                    tintColor={f.color}
                  />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[styles.cta, btnStyle]}>
            <Button
              label={isCreating ? 'Creating wallet…' : 'Create Wallet with Face ID'}
              onPress={handleCreate}
              loading={isCreating}
            />
            <Text style={styles.legal}>
              Your wallet is deployed on Arbitrum Sepolia testnet.{'\n'}
              Funds are non-custodial and controlled only by you.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  shieldWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accentDim,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { alignItems: 'center', gap: Spacing.sm },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
  },
  features: { alignSelf: 'stretch', gap: Spacing.sm },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, paddingTop: 2 },
  featureTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  featureDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  cta: { alignSelf: 'stretch', gap: Spacing.md },
  legal: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
