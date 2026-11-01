import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { useWallet } from '../store/wallet';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Spacing, Radius } from '../theme';

const TOKENS = ['ETH', 'USDC', 'ARB'];

export default function SendScreen() {
  const router = useRouter();
  const { balances, isMock, sendToken, isSending } = useWallet();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');

  const maxBalance = token === 'ETH' ? balances.eth : token === 'USDC' ? balances.usdc : balances.arb;

  const handleSend = async () => {
    if (!to.startsWith('0x') || to.length !== 42) {
      Alert.alert('Invalid address', 'Please enter a valid Ethereum address (0x...)');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount');
      return;
    }
    if (Number(amount) > maxBalance) {
      Alert.alert('Insufficient balance', `You only have ${maxBalance} ${token}`);
      return;
    }

    if (isMock) {
      Alert.alert('Demo mode', 'Connect the backend to send real transactions.', [
        { text: 'OK' },
      ]);
      return;
    }

    try {
      const txHash = await sendToken(to, amount, token);
      router.replace('/(tabs)');
      Alert.alert('Sent!', `Transaction: ${txHash.slice(0, 10)}...`);
    } catch (e: any) {
      if (!e?.message?.includes('cancel')) {
        Alert.alert('Send failed', e?.message);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <SymbolView name="xmark" size={16} tintColor={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>Send</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Token selector */}
          <Card>
            <Text style={styles.label}>Token</Text>
            <View style={styles.tokens}>
              {TOKENS.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.tokenBtn, token === t && styles.tokenBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setToken(t);
                  }}
                >
                  <Text style={[styles.tokenText, token === t && styles.tokenTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.balance}>Balance: {maxBalance.toFixed(4)} {token}</Text>
          </Card>

          {/* Amount */}
          <Card>
            <Text style={styles.label}>Amount</Text>
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
              <Pressable onPress={() => setAmount(maxBalance.toFixed(4))} style={styles.maxBtn}>
                <Text style={styles.maxText}>MAX</Text>
              </Pressable>
            </View>
          </Card>

          {/* To address */}
          <Card>
            <Text style={styles.label}>To address</Text>
            <TextInput
              style={styles.addressInput}
              value={to}
              onChangeText={setTo}
              placeholder="0x..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </Card>

          <View style={styles.spacer} />

          <Button
            label={isSending ? 'Confirming with Face ID…' : `Send ${amount || '0'} ${token}`}
            onPress={handleSend}
            loading={isSending}
            disabled={!to || !amount}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  label: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  tokens: { flexDirection: 'row', gap: Spacing.sm },
  tokenBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  tokenBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim },
  tokenText: { color: Colors.textSecondary, fontWeight: '600' },
  tokenTextActive: { color: Colors.accent },
  balance: { marginTop: Spacing.sm, color: Colors.textMuted, fontSize: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  maxBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  maxText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  addressInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  spacer: { flex: 1 },
});
