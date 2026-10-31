import { Redirect } from 'expo-router';
import { useWallet } from '../store/wallet';

export default function Index() {
  const stage = useWallet((s) => s.stage);

  if (stage === 'loading') return null;
  if (stage === 'onboarding') return <Redirect href="/onboarding" />;
  if (stage === 'locked') return <Redirect href="/unlock" />;
  return <Redirect href="/(tabs)" />;
}
