import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useWallet } from '../../store/wallet';
import { Colors, Spacing, Radius } from '../../theme';

interface RowProps {
  symbol?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}

function SettingRow({ symbol, label, value, onPress, danger, last }: RowProps) {
  return (
    <>
      <Pressable
        onPress={() => {
          if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }
        }}
        style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}
      >
        {symbol ? (
          <SymbolView
            name={symbol as any}
            size={18}
            tintColor={danger ? Colors.red : Colors.textSecondary}
            style={styles.rowIcon}
          />
        ) : null}
        <Text style={[styles.rowLabel, danger && { color: Colors.red }]}>{label}</Text>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
        ) : onPress ? (
          <SymbolView name="chevron.right" size={14} tintColor={Colors.textMuted} />
        ) : null}
      </Pressable>
      {!last && <View style={styles.divider} />}
    </>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { walletAddress, lock, isMock } = useWallet();

  const handleReset = () => {
    Alert.alert(
      'Reset Wallet',
      'Removes your wallet from this device. Funds remain on-chain and recoverable with your passkey.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('safe_wallet_address');
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
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.sectionLabel}>Account</Text>
        <Section>
          <SettingRow
            symbol="doc.on.doc"
            label="Wallet address"
            value={walletAddress
              ? walletAddress.slice(0, 10) + '…' + walletAddress.slice(-6)
              : 'Not connected'}
            onPress={walletAddress ? () => {
              Clipboard.setString(walletAddress);
              Alert.alert('Copied', 'Address copied to clipboard.');
            } : undefined}
          />
          <SettingRow
            symbol="network"
            label="Network"
            value="Arbitrum Sepolia"
          />
          <SettingRow
            symbol="faceid"
            label="Authentication"
            value="Face ID"
            last
          />
        </Section>


        <Text style={styles.sectionLabel}>Actions</Text>
        <Section>
          <SettingRow
            symbol="lock.fill"
            label="Lock wallet"
            onPress={lock}
          />
          <SettingRow
            symbol="arrow.up.right.square"
            label="View on Arbiscan"
            onPress={() => walletAddress
              ? Linking.openURL(`https://sepolia.arbiscan.io/address/${walletAddress}`)
              : undefined}
          />
          <SettingRow
            symbol="trash.fill"
            label="Reset device wallet"
            onPress={handleReset}
            danger
            last
          />
        </Section>

        <Text style={styles.version}>Safe Wallet · v1.0 · Built on Safe Protocol</Text>
      </View>
    </SafeAreaView>
  );
}

// Clipboard import at top level
import { Clipboard } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
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
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  rowPressed: { opacity: 0.5 },
  rowIcon: { width: 20, height: 20 },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  rowValue: { fontSize: 13, color: Colors.textSecondary, maxWidth: 180 },
  divider: { height: 1, backgroundColor: Colors.cardBorder },
  version: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
});
