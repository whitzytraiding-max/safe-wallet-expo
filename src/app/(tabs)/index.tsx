import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Alert, Clipboard } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useWallet } from '../../store/wallet';
import { AssetRow } from '../../components/AssetRow';
import { Colors, Spacing, Radius } from '../../theme';

function shortAddr(addr: string) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

const ACTIONS: { label: string; symbol: string; route: string | null }[] = [
  { label: 'Send', symbol: 'arrow.up.circle.fill', route: '/send' },
  { label: 'Receive', symbol: 'arrow.down.circle.fill', route: '/receive' },
  { label: 'Swap', symbol: 'arrow.left.arrow.right', route: '/swap' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { walletAddress, balances, isMock, isRefreshing, refreshBalances, lock } = useWallet();

  const headerOp = useSharedValue(0);
  const cardY = useSharedValue(14);
  const cardOp = useSharedValue(0);
  const assetsOp = useSharedValue(0);

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 380 });
    cardOp.value = withDelay(100, withTiming(1, { duration: 420 }));
    cardY.value = withDelay(100, withSpring(0, { damping: 24, stiffness: 200 }));
    assetsOp.value = withDelay(260, withTiming(1, { duration: 420 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ translateY: cardY.value }],
  }));
  const assetsStyle = useAnimatedStyle(() => ({ opacity: assetsOp.value }));

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Clipboard.setString(walletAddress);
    Alert.alert('Copied', 'Wallet address copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshBalances}
              tintColor={Colors.accent}
            />
          }
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerLeft}>
              <View style={styles.logoMark}>
                <Text style={styles.logoText}>SW</Text>
              </View>
              <View>
                <Text style={styles.appName}>Safe Wallet</Text>
                {walletAddress ? (
                  <Pressable onPress={handleCopyAddress} hitSlop={8}>
                    <Text style={styles.addressLabel}>
                      {shortAddr(walletAddress)}
                      {isMock ? '  ·  demo' : '  ·  Arbitrum'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                lock();
              }}
              style={styles.lockBtn}
              hitSlop={12}
            >
              <SymbolView name="lock.fill" size={20} tintColor={Colors.textSecondary} />
            </Pressable>
          </Animated.View>

          {/* Balance card */}
          <Animated.View style={[styles.balanceCard, cardStyle]}>
            <View style={styles.balanceTop}>
              <Text style={styles.balanceLabel}>Portfolio Value</Text>
              <View style={styles.networkPill}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>{isMock ? 'Demo' : 'Arbitrum'}</Text>
              </View>
            </View>

            <Text style={styles.balanceAmount}>${balances.totalUSD.toFixed(2)}</Text>
            {isMock && (
              <Text style={styles.demoNote}>Connect backend for live balances</Text>
            )}

            {/* Quick actions */}
            <View style={styles.actions}>
              {ACTIONS.map((a) => (
                <Pressable
                  key={a.label}
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (a.route) router.push(a.route as any);
                  }}
                >
                  <SymbolView name={a.symbol as any} size={20} tintColor={Colors.accent} />
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Assets */}
          <Animated.View style={[styles.section, assetsStyle]}>
            <Text style={styles.sectionTitle}>Assets</Text>
            <View style={styles.assetCard}>
              <AssetRow symbol="ETH" name="Ethereum" balance={balances.eth} usdValue={balances.eth * 2450} />
              <View style={styles.divider} />
              <AssetRow symbol="USDC" name="USD Coin" balance={balances.usdc} usdValue={balances.usdc} />
              <View style={styles.divider} />
              <AssetRow symbol="ARB" name="Arbitrum" balance={balances.arb} usdValue={balances.arb * 0.72} />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: 110 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  appName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  addressLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  lockBtn: { padding: 4 },

  balanceCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  networkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  networkText: { color: Colors.accent, fontSize: 11, fontWeight: '600' },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginTop: 4,
  },
  demoNote: { color: Colors.yellow, fontSize: 12 },

  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  actionBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionBtnPressed: { opacity: 0.65 },
  actionLabel: { color: Colors.accent, fontSize: 11, fontWeight: '600' },

  section: { gap: Spacing.sm },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  assetCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
  },
  divider: { height: 1, backgroundColor: Colors.cardBorder },
});
