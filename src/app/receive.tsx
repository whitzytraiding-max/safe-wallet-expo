import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Clipboard } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { useWallet } from '../store/wallet';
import { Colors, Spacing, Radius } from '../theme';

export default function ReceiveScreen() {
  const router = useRouter();
  const { walletAddress } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!walletAddress) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <SymbolView name="xmark" size={16} tintColor={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>Receive</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Network badge */}
          <View style={styles.networkRow}>
            <View style={styles.networkDot} />
            <Text style={styles.networkText}>Arbitrum Sepolia</Text>
          </View>

          {/* QR code placeholder */}
          <View style={styles.qrWrap}>
            <View style={styles.qrBox}>
              <SymbolView name="qrcode" size={120} tintColor={Colors.textPrimary} />
            </View>
            <Text style={styles.qrHint}>Scan to receive funds on Arbitrum</Text>
          </View>

          {/* Address */}
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>Wallet address</Text>
            <Text style={styles.addressText} selectable>
              {walletAddress ?? 'No wallet connected'}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.7 }]}
              onPress={handleCopy}
            >
              <SymbolView
                name={copied ? 'checkmark.circle.fill' : 'doc.on.doc.fill'}
                size={16}
                tintColor={copied ? Colors.green : Colors.accent}
              />
              <Text style={[styles.copyText, copied && { color: Colors.green }]}>
                {copied ? 'Copied!' : 'Copy address'}
              </Text>
            </Pressable>
          </View>

          {/* Info note */}
          <View style={styles.infoBox}>
            <SymbolView name="info.circle" size={15} tintColor={Colors.textMuted} />
            <Text style={styles.infoText}>
              Only send Arbitrum-compatible assets to this address. Sending assets from other networks may result in permanent loss.
            </Text>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },

  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'center',
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  networkDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.accent },
  networkText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },

  qrWrap: { alignItems: 'center', gap: Spacing.md },
  qrBox: {
    width: 200,
    height: 200,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrHint: { color: Colors.textSecondary, fontSize: 13 },

  addressCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  addressLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  addressText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Menlo',
    lineHeight: 20,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  copyText: { color: Colors.accent, fontSize: 14, fontWeight: '600' },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
  },
  infoText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
