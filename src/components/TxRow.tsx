import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../services/api';
import { Colors, Spacing, Radius } from '../theme';

interface Props {
  tx: Transaction;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function shortAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

export function TxRow({ tx }: Props) {
  const isSend = tx.type === 'send';
  const amountColor = isSend ? Colors.red : Colors.green;
  const sign = isSend ? '−' : '+';
  const counterparty = isSend ? tx.to : tx.from;
  const isConfirmed = tx.status === 'confirmed';

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: isSend ? Colors.redDim : Colors.accentDim }]}>
        <Text style={[styles.iconArrow, { color: isSend ? Colors.red : Colors.accent }]}>
          {isSend ? '↑' : '↓'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.type}>{isSend ? 'Sent' : 'Received'} {tx.symbol}</Text>
        <Text style={styles.sub}>{shortAddr(counterparty)} · {timeAgo(tx.timestamp)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {sign}{tx.amount} {tx.symbol}
        </Text>
        <View style={[styles.badge, isConfirmed ? styles.badgeGreen : styles.badgeYellow]}>
          <Text style={[styles.badgeText, isConfirmed ? styles.badgeTextGreen : styles.badgeTextYellow]}>
            {isConfirmed ? 'CONFIRMED' : 'PENDING'}
          </Text>
        </View>
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconArrow: { fontSize: 17, fontWeight: '700' },
  info: { flex: 1 },
  type: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  sub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '600' },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeGreen: { backgroundColor: Colors.greenDim },
  badgeYellow: { backgroundColor: Colors.yellowDim },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  badgeTextGreen: { color: Colors.green },
  badgeTextYellow: { color: Colors.yellow },
});
