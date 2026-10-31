import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { useWallet } from '../../store/wallet';
import { Colors } from '../../theme';

export default function TabLayout() {
  const router = useRouter();
  const stage = useWallet((s) => s.stage);

  useEffect(() => {
    if (stage === 'locked') router.replace('/unlock');
  }, [stage]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : Colors.card,
          borderTopColor: Colors.cardBorder,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarBackground: Platform.OS === 'ios'
          ? () => <BlurView intensity={90} tint="dark" style={{ flex: 1 }} />
          : undefined,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="creditcard.fill" size={size} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="list.clipboard.fill" size={size} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="gearshape.fill" size={size} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
