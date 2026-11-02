# Safe Wallet — iOS App

React Native / Expo iOS app for a passkey-secured [Safe](https://safe.global) smart account wallet on **Arbitrum Sepolia** testnet. **No seed phrase. No private key. Face ID is your wallet.**

**TestFlight**: Available on request (internal testing, App ID `6828720770`)

## What it does

Face ID creates your wallet. Tapping "Send" opens Face ID again. There's no seed phrase to write down and no private key — the P-256 key pair lives in the iOS Secure Enclave and never leaves the device. Balances are fetched live from Arbitrum Sepolia across ETH, USDC, and ARB.

## Architecture overview

```
iPhone Secure Enclave (P-256 key)
        │
        │ WebAuthn (react-native-passkey)
        ▼
  Safe Wallet App (Expo / React Native)
        │
        │ REST API
        ▼
  Backend Relayer (Node.js / Vercel)
        │
        │ viem + @safe-global/protocol-kit
        ▼
  Arbitrum Sepolia
    ├─ SafeWebAuthnSignerContract  ← your "key" on-chain
    └─ Safe smart account          ← your wallet
```

### The no-seed-phrase model

Standard crypto wallets generate a seed phrase that maps to a private key. Lose the seed phrase → lose everything. This wallet takes a different approach:

1. On wallet creation, the app calls `navigator.credentials.create()` — iOS generates a P-256 key pair in the **Secure Enclave** and returns the public key. The private key never leaves the chip.
2. The public key (x, y coordinates) is sent to the backend.
3. The backend deploys a **SafeWebAuthnSigner** contract — a contract that knows your public key and can verify P-256 signatures on-chain.
4. A **Safe smart account** is deployed with that signer contract as its sole owner.

To authorize a transaction, the user taps "Confirm" → Face ID → Secure Enclave signs with the passkey private key → signature is verified on-chain by the [Daimo P-256 verifier](https://github.com/daimo-eth/p256-verifier) (`0xc2b78104907F722DABAc4C69f826a522B2754De4`), a pure-Solidity verifier deployed across major EVM chains via CREATE2.

### Why Safe?

Safe is the obvious choice for a production smart contract wallet — it's audited, battle-tested, and used by serious teams (Coinbase, Gnosis, 1inch) for treasury management. More importantly, it's modular: the 1-of-1 passkey signer you start with can be upgraded to multi-sig later without touching the account address. ERC-4337 compatibility also means gas abstraction is straightforward when you want it.

### Signature construction

The WebAuthn response from the Secure Enclave is a raw P-256 signature `(r, s)` over the `clientDataHash`. The backend packs this into the format `SafeWebAuthnSigner.isValidSignature()` expects:

```
ABI-encoded: (authenticatorData, clientDataFields, r, s)
```

This is then wrapped in Safe's **contract signature format**:
```
[signerAddress padded to 32 bytes]
[offset to dynamic data = 65]
[signature type = 0x00]
[webAuthnSig length as uint256]
[webAuthnSig bytes]
```

The backend handles all packing — the mobile app only needs to forward the raw WebAuthn assertion fields.

## Screens

| Screen | Description |
|---|---|
| Onboarding | "Create Wallet" → triggers Face ID passkey registration |
| Unlock | Face ID assertion on every app open |
| Home (Dashboard) | Total balance in USD, asset breakdown, quick-action buttons |
| Send | Token/amount/address input → Face ID confirm → tx submitted |
| Receive | Wallet address + copy button |
| Swap | UI stub (DEX integration todo) |

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Expo SDK 58 / React Native | Native passkey API access |
| Passkeys | `react-native-passkey` | WebAuthn on iOS Secure Enclave |
| State | Zustand | Simple, minimal boilerplate |
| Navigation | Expo Router (file-based) | Works natively with Expo |
| Styling | StyleSheet + custom theme | Dark system theme |
| Backend | Node.js relayer on Vercel | Pays gas, handles Safe SDK |

## Running locally

```bash
npm install
npx expo start
```

Requires a physical iPhone — passkeys do not work in iOS Simulator (Secure Enclave unavailable).

Set `EXPO_PUBLIC_API_URL` in `.env.local` to point at the backend:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Known limitations / production gaps

- **Passkeys need a real device** — WebAuthn is not available in iOS Simulator
- **RP ID** is currently `awakensystem.app` — needs to be its own domain in production
- **No tx history** — backend returns `[]`; needs a blockchain indexer (The Graph / Alchemy)
- **No recovery flow** — if the passkey is lost and not in iCloud Keychain, the Safe account is inaccessible (mitigated in production by adding a guardian as a second owner)
- **Testnet only** — swap `arbitrumSepolia` → `arbitrum` in backend `config.ts` for mainnet

## Repo companion

Relayer backend: [safe-wallet-backend](https://github.com/whitzytraiding-max/safe-wallet-backend)
