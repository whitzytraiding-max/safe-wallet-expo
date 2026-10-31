import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { useWallet } from '../store/wallet';
import { Button } from '../components/Button';
import { Colors, Spacing, Radius } from '../theme';

const TOKENS = ['ETH', 'USDC', 'ARB'];
const RATES: Record<string, Record<string, number>> = {
  ETH: { USDC: 2450, ARB: 3402, ETH: 1 },
  USDC: { ETH: 0.000408, ARB: 1.389, USDC: 1 },
  ARB: { ETH: 0.000294, USDC: 0.72, ARB: 1 },
};

export default function SwapScreen() {
  const router = useRouter();
  const { balances, isMock } = useWallet();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');

  const fromBalance = fromToken === 'ETH' ? balances.eth : fromToken === 'USDC' ? balances.usdc : balances.arb;
  const rate = RATES[fromToken]?.[toToken] ?? 0;
  const toAmount = amount && !isNaN(Number(amount)) ? (Number(amount) * rate).toFixed(4) : '—';

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prev = fromToken;
    setFromToken(toToken);
    setToToken(prev);
    setAmount('');
  };

  const handleSwap = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Enter an amount', 'Please enter how much you want to swap.');
      return;
    }
    if (Number(amount) > fromBalance) {
      Alert.alert('Insufficient balance', `You only have ${fromBalance.toFixed(4)} ${fromToken}.`);
      return;
    }
    Alert.alert(
      isMock ? 'Demo Swap' : 'Confirm Swap',
      `Swap ${amount} ${fromToken} → ${toAmount} ${toToken}\n\nRate: 1 ${fromToken} = ${rate.toLocaleString()} ${toToken}${isMock ? '\n\nThis is a demo — connect the backend to execute real swaps.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isMock ? 'Got it' : 'Swap',
          onPress: () => {
            if (!isMock) {
              // TODO: wire real swap when backend is connected
            }
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <SymbolView name="xmark" size={16} tintColor={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>Swap</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>

          {/* From */}
          <View style={styles.swapCard}>
            <Text style={styles.cardLabel}>From</Text>
            <View style={styles.tokenRow}>
              {TOKENS.filter(t => t !== toToken).map(t => (
                <Pressable
                  key={t}
                  style={[styles.tokenPill, fromToken === t && styles.tokenPillActive]}
                  onPress={() => { Haptics.selectionAsync(); setFromToken(t); setAmount(''); }}
                >
                  <Text style={[styles.tokenPillText, fromToken === t && styles.tokenPillTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                keyboardAppearance="dark"
              />
              <Pressable style={styles.maxBtn} onPress={() => setAmount(fromBalance.toFixed(4))}>
                <Text style={styles.maxText}>MAX</Text>
              </Pressable>
            </View>
            <Text style={styles.balanceHint}>Balance: {fromBalance.toFixed(4)} {fromToken}</Text>
          </View>

          {/* Flip button */}
          <Pressable style={styles.flipBtn} onPress={handleFlip}>
            <SymbolView name="arrow.up.arrow.down" size={18} tintColor={Colors.accent} />
          </Pressable>

          {/* To */}
          <View style={styles.swapCard}>
            <Text style={styles.cardLabel}>To</Text>
            <View style={styles.tokenRow}>
              {TOKENS.filter(t => t !== fromToken).map(t => (
                <Pressable
                  key={t}
                  style={[styles.tokenPill, toToken === t && styles.tokenPillActive]}
                  onPress={() => { Haptics.selectionAsync(); setToToken(t); }}
                >
                  <Text style={[styles.tokenPillText, toToken === t && styles.tokenPillTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.toAmount}>{toAmount}</Text>
          </View>

          {/* Rate */}
          {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
            <View style={styles.rateRow}>
              <SymbolView name="chart.line.uptrend.xyaxis" size={14} tintColor={Colors.textMuted} />
              <Text style={styles.rateText}>
                1 {fromToken} = {rate.toLocaleString()} {toToken}
              </Text>
            </View>
          )}

          {isMock && (
            <View style={styles.demoNote}>
              <SymbolView name="info.circle.fill" size={14} tintColor={Colors.yellow} />
              <Text style={styles.demoText}>Demo mode — swaps will execute when backend is connected</Text>
            </View>
          )}

          <View style={{ flex: 1 }} />

          <Button
            label={`Swap ${fromToken} → ${toToken}`}
            onPress={handleSwap}
            disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
          />
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
  content: { flex: 1, padding: Spacing.lg, paddingTop: Spacing.sm, gap: Spacing.sm },

  swapCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  tokenRow: { flexDirection: 'row', gap: Spacing.sm },
  tokenPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.bgSecondary,
  },
  tokenPillActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim },
  tokenPillText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tokenPillTextActive: { color: Colors.accent },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  amountInput: {
    flex: 1,
    fontSize: 30,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  maxBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  maxText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  balanceHint: { color: Colors.textMuted, fontSize: 12 },
  toAmount: { fontSize: 30, fontWeight: '600', color: Colors.textPrimary, paddingVertical: Spacing.xs },

  flipBtn: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.sm + 2,
  },
  rateText: { color: Colors.textSecondary, fontSize: 13 },

  demoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.yellowDim,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  demoText: { flex: 1, color: Colors.yellow, fontSize: 12, lineHeight: 18 },
});
