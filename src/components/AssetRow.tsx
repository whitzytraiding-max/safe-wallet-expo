import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../theme';

interface Props {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  color?: string;
}

const COLORS: Record<string, string> = {
  ETH: '#627EEA',
  USDC: '#2775CA',
  ARB: '#12AAFF',
};

export function AssetRow({ symbol, name, balance, usdValue, color }: Props) {
  const iconColor = color ?? COLORS[symbol] ?? Colors.accent;
  const initials = symbol.slice(0, 2);

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: iconColor + '1A' }]}>
        <Text style={[styles.iconText, { color: iconColor }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.balance}>{balance.toFixed(4)}</Text>
        <Text style={styles.usd}>${usdValue.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  info: { flex: 1 },
  symbol: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  name: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  balance: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  usd: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});
