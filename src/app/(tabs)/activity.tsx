import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useWallet } from '../../store/wallet';
import { TxRow } from '../../components/TxRow';
import { Colors, Spacing, Radius } from '../../theme';
import { Transaction } from '../../services/api';

function AnimatedTxRow({ tx, index }: { tx: Transaction; index: number }) {
  const op = useSharedValue(0);
  const y = useSharedValue(10);

  useEffect(() => {
    op.value = withDelay(index * 50, withTiming(1, { duration: 320 }));
    y.value = withDelay(index * 50, withTiming(0, { duration: 320 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View style={style}>
      <TxRow tx={tx} />
    </Animated.View>
  );
}

export default function ActivityScreen() {
  const { transactions, isRefreshing, refreshBalances } = useWallet();
  const headerOp = useSharedValue(0);

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 380 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, headerStyle]}>

        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          {transactions.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{transactions.length}</Text>
            </View>
          )}
        </View>

        {transactions.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <SymbolView name="tray.fill" size={32} tintColor={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Your transaction history will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(t) => t.hash}
            renderItem={({ item, index }) => (
              <View>
                <AnimatedTxRow tx={item} index={index} />
                {index < transactions.length - 1 && <View style={styles.divider} />}
              </View>
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshBalances}
                tintColor={Colors.accent}
              />
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  countBadge: {
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  list: { paddingBottom: 100 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingBottom: 80 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  emptySubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
