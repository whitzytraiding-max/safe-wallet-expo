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
  eth: 0.0421,
  usdc: 125.5,
  arb: 48.2,
  totalUSD: 312.84,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    hash: '0xabc1',
    type: 'receive',
    amount: '0.05',
    symbol: 'ETH',
    from: '0x1234567890123456789012345678901234565678',
    to: '0xYouraddr',
    timestamp: Date.now() - 3600000,
    status: 'confirmed',
  },
  {
    hash: '0xabc2',
    type: 'send',
    amount: '25.00',
    symbol: 'USDC',
    from: '0xYouraddr',
    to: '0x9876543210987654321098765432109876544321',
    timestamp: Date.now() - 86400000,
    status: 'confirmed',
  },
];
