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
import { WalletLogo } from '../../components/WalletLogo';
import { Sparkline } from '../../components/Sparkline';
import { Colors, Spacing, Radius } from '../../theme';

function shortAddr(addr: string) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

const ACTIONS = [
  { label: 'Send',    icon: '↑', route: '/send'    },
  { label: 'Receive', icon: '↓', route: '/receive' },
  { label: 'Swap',    icon: '⇄', route: '/swap'   },
];

export default function HomeScreen() {
  const router = useRouter();
  const { walletAddress, balances, isRefreshing, refreshBalances, lock } = useWallet();

  const headerOp  = useSharedValue(0);
  const cardY     = useSharedValue(16);
  const cardOp    = useSharedValue(0);
  const assetsOp  = useSharedValue(0);

  useEffect(() => {
    headerOp.value = withTiming(1,  { duration: 380 });
    cardOp.value   = withDelay(100, withTiming(1,  { duration: 420 }));
    cardY.value    = withDelay(100, withSpring(0,  { damping: 24, stiffness: 200 }));
    assetsOp.value = withDelay(260, withTiming(1,  { duration: 420 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value }));
  const cardStyle   = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
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
            <RefreshControl refreshing={isRefreshing} onRefresh={refreshBalances} tintColor={Colors.accent} />
          }
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerLeft}>
              <View style={styles.logoMark}>
                <WalletLogo size={26} />
              </View>
              <View>
                <View style={styles.appNameRow}>
                  <Text style={styles.appName}>Safe Wallet</Text>
                  <View style={styles.secureBadge}>
                    <View style={styles.secureDot} />
                    <Text style={styles.secureBadgeText}>Secure</Text>
                  </View>
                </View>
                {walletAddress ? (
                  <Pressable onPress={handleCopyAddress} hitSlop={8}>
                    <Text style={styles.addressLabel}>
                      {shortAddr(walletAddress)}{'  ·  Arbitrum'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); lock(); }}
              style={styles.scanBtn}
              hitSlop={12}
            >
              <SymbolView name="faceid" size={20} tintColor={Colors.textSecondary} />
            </Pressable>
          </Animated.View>

          {/* Balance card */}
          <Animated.View style={[styles.balanceCard, cardStyle]}>
            <View style={styles.balanceTop}>
              <Text style={styles.balanceLabel}>Portfolio Value</Text>
              <View style={styles.networkPill}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>Arbitrum</Text>
              </View>
            </View>

            <Text style={styles.balanceAmount}>${balances.totalUSD.toFixed(2)}</Text>

            <View style={styles.changeRow}>
              <Text style={styles.changeText}>+2.17% (24h)</Text>
            </View>

            {/* Sparkline */}
            <View style={styles.chartWrap}>
              <Sparkline width={320} height={52} color={Colors.accent} />
            </View>

            {/* Quick actions */}
            <View style={styles.actions}>
              {ACTIONS.map((a) => (
                <Pressable
                  key={a.label}
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(a.route as any);
                  }}
                >
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Assets */}
          <Animated.View style={[styles.section, assetsStyle]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assets</Text>
              <Text style={styles.sectionLink}>View all →</Text>
            </View>
            <View style={styles.assetCard}>
              <AssetRow symbol="ETH"  name="Ethereum" balance={balances.eth}  usdValue={balances.eth * 2450} />
              <View style={styles.divider} />
              <AssetRow symbol="USDC" name="USD Coin" balance={balances.usdc} usdValue={balances.usdc} />
              <View style={styles.divider} />
              <AssetRow symbol="ARB"  name="Arbitrum" balance={balances.arb}  usdValue={balances.arb * 0.72} />
            </View>
          </Animated.View>

          {/* Protected footer */}
          <Animated.View style={[styles.protectedRow, assetsStyle]}>
            <SymbolView name="shield.fill" size={14} tintColor={Colors.textMuted} />
            <Text style={styles.protectedText}>Protected by your access wallet</Text>
            <Text style={styles.protectedArrow}>→</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safe:      { flex: 1 },
  scroll:    { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 110 },

  /* Header */
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 34, height: 34,
    borderRadius: 9,
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appName:    { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  secureDot:      { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.green },
  secureBadgeText: { color: Colors.green, fontSize: 10, fontWeight: '600' },
  addressLabel:   { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  scanBtn:        { padding: 4 },

  /* Balance card */
  balanceCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  balanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  networkPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.accentBorder,
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
  changeRow: { flexDirection: 'row', alignItems: 'center' },
  changeText: { color: Colors.green, fontSize: 13, fontWeight: '600' },
  chartWrap: { marginHorizontal: -4, marginVertical: 4 },

  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    gap: 5,
  },
  actionBtnPressed: { opacity: 0.6 },
  actionIcon: { fontSize: 18, color: Colors.accent, fontWeight: '600' },
  actionLabel: { color: Colors.textPrimary, fontSize: 11, fontWeight: '600' },

  /* Assets */
  section: { gap: Spacing.xs },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  sectionLink:  { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  assetCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
  },
  divider: { height: 1, backgroundColor: Colors.cardBorder },

  /* Protected row */
  protectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  protectedText:  { flex: 1, color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  protectedArrow: { color: Colors.textMuted, fontSize: 13 },
});
