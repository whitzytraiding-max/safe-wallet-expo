import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useWallet } from '../../store/wallet';
import { Colors, Spacing, Radius } from '../../theme';

/* ─── Row building blocks ───────────────────────────────────────────── */
interface RowProps {
  symbol?: string;
  label: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
  rightNode?: React.ReactNode;
}

function Row({ symbol, label, value, badge, onPress, danger, last, rightNode }: RowProps) {
  return (
    <>
      <Pressable
        onPress={() => { if (onPress) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); } }}
        style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}
      >
        {symbol ? (
          <View style={[styles.rowIconWrap, danger && styles.rowIconWrapDanger]}>
            <SymbolView
              name={symbol as any}
              size={15}
              tintColor={danger ? Colors.red : Colors.textSecondary}
            />
          </View>
        ) : null}
        <Text style={[styles.rowLabel, danger && { color: Colors.red }]}>{label}</Text>
        {badge ? <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{badge}</Text></View> : null}
        {rightNode}
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
        ) : onPress ? (
          <SymbolView name="chevron.right" size={13} tintColor={Colors.textMuted} />
        ) : null}
      </Pressable>
      {!last && <View style={styles.divider} />}
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

/* ─── Main screen ───────────────────────────────────────────────────── */
export default function SettingsScreen() {
  const router  = useRouter();
  const { walletAddress, signerAddress, isMock, lock } = useWallet();

  const shortAddr = (addr: string | null) =>
    addr ? addr.slice(0, 8) + '…' + addr.slice(-6) : '—';

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    Clipboard.setString(walletAddress);
    Alert.alert('Copied', 'Address copied to clipboard.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Wallet',
      'Removes your wallet from this device. Funds remain on-chain and are recoverable with your passkey.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('safe_wallet_address');
            await SecureStore.deleteItemAsync('safe_wallet_signer');
            await SecureStore.deleteItemAsync('safe_wallet_credential_id');
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Settings</Text>
          <Pressable hitSlop={12} style={styles.bellBtn}>
            <SymbolView name="bell" size={20} tintColor={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Your Wallets hero card */}
        <Card>
          <Row
            symbol="shield.fill"
            label="Your Wallets"
            value="Main wallet & access wallet"
            onPress={() => {}}
          />
        </Card>

        {/* WALLETS section */}
        <SectionLabel label="WALLETS" />
        <Card>
          <Row
            symbol="creditcard.fill"
            label="Main wallet"
            value={shortAddr(walletAddress)}
            onPress={handleCopyAddress}
          />
          <Row
            symbol="globe"
            label="Access wallet"
            value={shortAddr(signerAddress)}
            badge="Active"
            onPress={() => {}}
            last
          />
        </Card>

        {/* SECURITY section */}
        <SectionLabel label="SECURITY" />
        <Card>
          <Row
            symbol="faceid"
            label="Authentication"
            value="Face ID / Passkey"
            onPress={() => {}}
          />
          <Row
            symbol="network"
            label="Network"
            value="Arbitrum Sepolia"
          />
          <Row
            label="Backend"
            rightNode={
              <View style={styles.backendStatus}>
                <View style={[styles.backendDot, !isMock && styles.backendDotLive]} />
                <Text style={styles.backendText}>
                  {isMock ? 'Demo mode — not connected' : 'Connected · Arbitrum Sepolia'}
                </Text>
              </View>
            }
            last
          />
        </Card>

        {/* ACTIONS section */}
        <SectionLabel label="ACTIONS" />
        <Card>
          <Row
            symbol="lock.fill"
            label="Lock wallet"
            onPress={lock}
          />
          <Row
            symbol="eye"
            label="View on Arbiscan"
            onPress={() =>
              walletAddress
                ? Linking.openURL(`https://sepolia.arbiscan.io/address/${walletAddress}`)
                : undefined
            }
          />
          <Row
            symbol="trash.fill"
            label="Reset device wallet"
            onPress={handleReset}
            danger
            last
          />
        </Card>

        <Text style={styles.version}>Safe Wallet · v1.0 · Built on Safe Protocol</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content:   { flex: 1, padding: Spacing.lg, gap: Spacing.xs, paddingBottom: 100 },

  titleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  title:     { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  bellBtn:   { padding: 4 },

  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  rowPressed: { opacity: 0.5 },
  rowIconWrap: {
    width: 30, height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconWrapDanger: { backgroundColor: 'rgba(239,68,68,0.1)' },
  rowLabel:  { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  rowValue:  { fontSize: 12, color: Colors.textSecondary, maxWidth: 160 },
  divider:   { height: 1, backgroundColor: Colors.cardBorder },

  activeBadge: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: { color: Colors.green, fontSize: 11, fontWeight: '700' },

  backendStatus: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backendDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  backendDotLive:  { backgroundColor: Colors.green },
  backendText:  { color: Colors.textSecondary, fontSize: 12 },

  version: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
});
