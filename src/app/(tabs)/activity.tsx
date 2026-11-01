import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useWallet } from '../../store/wallet';
import { Transaction } from '../../services/api';
import { Colors, Spacing, Radius } from '../../theme';

type Filter = 'all' | 'send' | 'receive' | 'swap';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'send',    label: 'Send'    },
  { key: 'receive', label: 'Receive' },
  { key: 'swap',    label: 'Swap'    },
];

function relativeDay(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
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
  if (addr.length <= 13) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function TxCard({ tx, index }: { tx: Transaction; index: number }) {
  const op = useSharedValue(0);
  const y  = useSharedValue(8);

  useEffect(() => {
    op.value = withDelay(index * 55, withTiming(1, { duration: 300 }));
    y.value  = withDelay(index * 55, withTiming(0, { duration: 300 }));
  }, []);

  const anim = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: y.value }] }));

  const isSend    = tx.type === 'send';
  const isSwap    = tx.type === 'swap';
  const isReceive = !isSend && !isSwap;

  const iconColor  = isSend ? Colors.red : Colors.accent;
  const iconBg     = isSend ? 'rgba(239,68,68,0.12)' : Colors.accentDim;
  const iconSymbol = isSend ? 'arrow.up' : isSwap ? 'arrow.left.arrow.right' : 'arrow.down';

  const amountColor = isSend ? Colors.red : Colors.green;
  const sign        = isSend ? '−' : '+';

  const label     = isSend ? `Sent ${tx.symbol}` : isSwap ? 'Swapped tokens' : `Received ${tx.symbol}`;
  const sub       = shortAddr(isSend ? tx.to : tx.from);

  return (
    <Animated.View style={[styles.txRow, anim]}>
      <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
        <SymbolView name={iconSymbol as any} size={14} tintColor={iconColor} />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txLabel}>{label}</Text>
        <Text style={styles.txSub}>{sub}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: amountColor }]}>
          {sign}{tx.amount} {tx.symbol}
        </Text>
        <View style={styles.txConfirmed}>
          <Text style={styles.txConfirmedText}>✓ Confirmed</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function groupByDay(txs: Transaction[]): { day: string; ts: number; items: Transaction[] }[] {
  const map = new Map<string, { ts: number; items: Transaction[] }>();
  for (const tx of txs) {
    const day = relativeDay(tx.timestamp);
    if (!map.has(day)) map.set(day, { ts: tx.timestamp, items: [] });
    map.get(day)!.items.push(tx);
  }
  return Array.from(map.entries()).map(([day, v]) => ({ day, ...v }));
}

export default function ActivityScreen() {
  const { transactions, isRefreshing, refreshBalances } = useWallet();
  const [filter, setFilter] = useState<Filter>('all');

  const headerOp = useSharedValue(0);
  useEffect(() => { headerOp.value = withTiming(1, { duration: 380 }); }, []);
  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value }));

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const groups = groupByDay(filtered);
  let globalIndex = 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshBalances} tintColor={Colors.accent} />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Text style={styles.title}>Activity</Text>
          <Pressable hitSlop={12} style={styles.searchBtn}>
            <SymbolView name="magnifyingglass" size={20} tintColor={Colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {/* Filter pills */}
        <Animated.View style={[styles.filterRow, headerStyle]}>
          {FILTERS.map(f => (
            <Pressable
              key={f.key}
              style={[styles.pill, filter === f.key && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(f.key);
              }}
            >
              <Text style={[styles.pillText, filter === f.key && styles.pillTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Transaction groups */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <SymbolView name="tray.fill" size={28} tintColor={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No transactions</Text>
            <Text style={styles.emptySub}>Your history will appear here</Text>
          </View>
        ) : (
          groups.map(({ day, ts, items }) => (
            <View key={day} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupDay}>{day}</Text>
                <Text style={styles.groupAgo}>{timeAgo(ts)}</Text>
              </View>
              <View style={styles.groupCard}>
                {items.map((tx, i) => {
                  const idx = globalIndex++;
                  return (
                    <View key={tx.hash}>
                      <TxCard tx={tx} index={idx} />
                      {i < items.length - 1 && <View style={styles.divider} />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll:    { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 110 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title:     { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  searchBtn: { padding: 4 },

  filterRow: { flexDirection: 'row', gap: Spacing.sm },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  pillText:       { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  group:       { gap: Spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  groupDay:    { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  groupAgo:    { color: Colors.textMuted, fontSize: 12 },
  groupCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
  },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  txIcon: {
    width: 38, height: 38,
    borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  txInfo:   { flex: 1 },
  txLabel:  { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  txSub:    { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  txRight:  { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  txConfirmed: {},
  txConfirmedText: { color: Colors.green, fontSize: 11, fontWeight: '600' },

  divider: { height: 1, backgroundColor: Colors.cardBorder },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  emptySub:   { color: Colors.textSecondary, fontSize: 14 },
});
