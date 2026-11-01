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
  type: 'send' | 'receive' | 'contract';
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
  eth: 1.284,
  usdc: 1250.0,
  arb: 742.5,
  totalUSD: 7994.42,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    hash: '0xd4f2a8b1c3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    type: 'receive',
    amount: '0.5',
    symbol: 'ETH',
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x7F3a4f2B8E9c1D5A6B7C8D9E0F1A2B3C4D5E6B19',
    timestamp: Date.now() - 3600000,
    status: 'confirmed',
  },
  {
    hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    type: 'send',
    amount: '250.00',
    symbol: 'USDC',
    from: '0x7F3a4f2B8E9c1D5A6B7C8D9E0F1A2B3C4D5E6B19',
    to: '0x3B9A14Fc7E2d8C5F1A0B4D6E8F2C1A7B5D3E9F0C',
    timestamp: Date.now() - 86400000,
    status: 'confirmed',
  },
  {
    hash: '0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    type: 'receive',
    amount: '500',
    symbol: 'ARB',
    from: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B',
    to: '0x7F3a4f2B8E9c1D5A6B7C8D9E0F1A2B3C4D5E6B19',
    timestamp: Date.now() - 172800000,
    status: 'confirmed',
  },
];
