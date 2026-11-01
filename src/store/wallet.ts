import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, WalletBalances, Transaction, MOCK_BALANCES, MOCK_TRANSACTIONS } from '../services/api';
import { createPasskey, authenticatePasskey, parseAssertion } from '../services/passkey';

const DEMO_MODE = false;

const storage = {
  get: (key: string) => DEMO_MODE ? Promise.resolve(null) : SecureStore.getItemAsync(key),
  set: (key: string, val: string) => DEMO_MODE ? Promise.resolve() : SecureStore.setItemAsync(key, val),
};

type Stage = 'loading' | 'onboarding' | 'locked' | 'unlocked';

interface WalletState {
  stage: Stage;
  walletAddress: string | null;
  signerAddress: string | null;
  credentialId: string | null;
  balances: WalletBalances;
  transactions: Transaction[];
  isMock: boolean;
  isCreating: boolean;
  isUnlocking: boolean;
  isRefreshing: boolean;
  isSending: boolean;
  lastError: string | null;

  init: () => Promise<void>;
  createWallet: () => Promise<void>;
  unlock: () => Promise<void>;
  lock: () => void;
  refreshBalances: () => Promise<void>;
  sendToken: (to: string, amount: string, token: string) => Promise<string>;
  clearError: () => void;
}

const WALLET_ADDRESS_KEY = 'safe_wallet_address';
const SIGNER_ADDRESS_KEY = 'safe_wallet_signer';
const CREDENTIAL_ID_KEY = 'safe_wallet_credential_id';

export const useWallet = create<WalletState>((set, get) => ({
  stage: 'loading',
  walletAddress: null,
  signerAddress: null,
  credentialId: null,
  balances: MOCK_BALANCES,
  transactions: MOCK_TRANSACTIONS,
  isMock: true,
  isCreating: false,
  isUnlocking: false,
  isRefreshing: false,
  isSending: false,
  lastError: null,

  init: async () => {
    const address = await storage.get(WALLET_ADDRESS_KEY);
    const signer = await storage.get(SIGNER_ADDRESS_KEY);
    const credId = await storage.get(CREDENTIAL_ID_KEY);
    if (address) {
      set({ walletAddress: address, signerAddress: signer, credentialId: credId, stage: 'locked' });
    } else {
      set({ stage: 'onboarding' });
    }
  },

  createWallet: async () => {
    set({ isCreating: true, lastError: null });
    try {
      const userId = Date.now().toString();
      const passkey = await createPasskey(userId);

      let safeAddress: string;
      let signerAddress: string;
      let isMock = false;

      try {
        const result = await api.createWallet(passkey.pubkeyX, passkey.pubkeyY);
        safeAddress = result.safeAddress;
        signerAddress = result.signerAddress;
      } catch {
        // Backend unreachable or relayer not yet funded — use demo addresses
        safeAddress = DEMO_MODE
          ? '0x7F3a4f2B8E9c1D5A6B7C8D9E0F1A2B3C4D5E6B19'
          : '0x' + passkey.credentialId.replace(/-/g, '').slice(0, 40).padEnd(40, '0');
        signerAddress = DEMO_MODE
          ? '0xF7488fFbe67327ac9f37D5F722d83Fc900852Fbf'
          : '0x' + passkey.pubkeyX.slice(2, 42).padEnd(40, '0');
        isMock = true;
      }

      await storage.set(WALLET_ADDRESS_KEY, safeAddress);
      await storage.set(SIGNER_ADDRESS_KEY, signerAddress);
      await storage.set(CREDENTIAL_ID_KEY, passkey.credentialId);

      set({
        walletAddress: safeAddress,
        signerAddress,
        credentialId: passkey.credentialId,
        stage: 'unlocked',
        isMock,
        isCreating: false,
      });

      get().refreshBalances();
    } catch (err: any) {
      set({ isCreating: false, lastError: err?.message ?? 'Failed to create wallet' });
      throw err;
    }
  },

  unlock: async () => {
    set({ isUnlocking: true, lastError: null });
    try {
      const { credentialId } = get();
      await authenticatePasskey(credentialId ?? undefined);
      set({ stage: 'unlocked', isUnlocking: false });
      get().refreshBalances();
    } catch (err: any) {
      set({ isUnlocking: false, lastError: err?.message ?? 'Authentication failed' });
      throw err;
    }
  },

  lock: () => set({ stage: 'locked' }),

  refreshBalances: async () => {
    const { walletAddress } = get();
    if (!walletAddress) return;
    set({ isRefreshing: true });

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 400));
      set({ balances: MOCK_BALANCES, transactions: MOCK_TRANSACTIONS, isMock: true, isRefreshing: false });
      return;
    }

    try {
      const [balances, transactions] = await Promise.all([
        api.getBalance(walletAddress),
        api.getTransactions(walletAddress),
      ]);
      set({ balances, transactions, isMock: false, isRefreshing: false });
    } catch {
      set({ balances: MOCK_BALANCES, transactions: MOCK_TRANSACTIONS, isMock: true, isRefreshing: false });
    }
  },

  sendToken: async (to: string, amount: string, token: string) => {
    const { walletAddress, signerAddress, credentialId, isMock } = get();
    if (!walletAddress) throw new Error('No wallet');
    if (!signerAddress) throw new Error('No signer address');
    set({ isSending: true, lastError: null });

    if (isMock) {
      await new Promise(r => setTimeout(r, 1800));
      set({ isSending: false });
      return '0xdemo' + Date.now().toString(16).padStart(60, '0');
    }
    try {
      const { safeTxHash } = await api.prepareSend(walletAddress, to, amount, token);
      const assertion = await authenticatePasskey(credentialId ?? undefined);
      const parsed = parseAssertion(assertion.rawResponse);
      const { txHash } = await api.executeSend({
        safeTxHash,
        signerAddress,
        authenticatorData: parsed.authenticatorData,
        clientDataFields: parsed.clientDataFields,
        r: parsed.r,
        s: parsed.s,
      });

      await get().refreshBalances();
      set({ isSending: false });
      return txHash;
    } catch (err: any) {
      set({ isSending: false, lastError: err?.message ?? 'Send failed' });
      throw err;
    }
  },

  clearError: () => set({ lastError: null }),
}));
