const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export interface WalletBalances {
  eth: number;
  usdc: number;
  arb: number;
  totalUSD: number;
}

export interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'contract' | 'swap';
  amount: string;
  symbol: string;
  to: string;
  from: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface CreateWalletResponse {
  safeAddress: string;
  signerAddress: string;
  network: string;
  explorerUrl: string;
}

export interface ExecuteSendParams {
  safeTxHash: string;
  signerAddress: string;
  authenticatorData: string;
  clientDataFields: string;
  r: string;
  s: string;
}

export const api = {
  createWallet: (x: string, y: string) =>
    request<CreateWalletResponse>('/api/wallet/create', {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    }),

  getBalance: (address: string) =>
    request<WalletBalances>(`/api/wallet/${address}/balance`),

  getTransactions: (address: string) =>
    request<Transaction[]>(`/api/wallet/${address}/transactions`),

  prepareSend: (safeAddress: string, to: string, amount: string, token: string) =>
    request<{ safeTxHash: string }>('/api/wallet/send/prepare', {
      method: 'POST',
      body: JSON.stringify({ safeAddress, to, amount, token }),
    }),

  executeSend: (params: ExecuteSendParams) =>
    request<{ txHash: string; explorerUrl: string }>('/api/wallet/send/execute', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

export const MOCK_BALANCES: WalletBalances = {
  eth: 0.0421,
  usdc: 125.5,
  arb: 48.2,
  totalUSD: 312.84,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    hash: '0xd4f2a8b1c3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    type: 'receive',
    amount: '0.05',
    symbol: 'ETH',
    from: '0x1234567890abcdef12345678',
    to: '0x7F3a4f2B8E9c1D5A6B7C8D9E0F1A2B3C4D5E6B19',
    timestamp: Date.now() - 3600000,
    status: 'confirmed',
  },
  {
    hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    type: 'send',
    amount: '25.00',
    symbol: 'USDC',
    from: '0x7F3a4f2B8E9c1D5A6B7C8D9E0F1A2B3C4D5E6B19',
    to: '0x9876543210fedcba98765432',
    timestamp: Date.now() - 86400000,
    status: 'confirmed',
  },
  {
    hash: '0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    type: 'swap',
    amount: '12.50',
    symbol: 'USDC',
    from: '0x5678901234abcdef56789012',
    to: '0x7F3a4f2B8E9c1D5A6B7C8D9E0F1A2B3C4D5E6B19',
    timestamp: Date.now() - 86400000 - 7200000,
    status: 'confirmed',
  },
];
