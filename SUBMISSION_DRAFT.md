# Submission draft — for Michael to review before sending to Tom

---

**Subject:** Safe Wallet challenge

Hi Tom,

Here's what I built: a passkey-secured Safe smart account wallet on Arbitrum Sepolia. The idea is that your Face ID is literally the wallet — no seed phrase, no private key you could lose. iOS generates a P-256 key pair in the Secure Enclave when you set up the wallet, and that public key becomes the sole owner of a Safe smart account deployed on-chain.

The part that took the most work was the signature encoding. WebAuthn gives you `(authenticatorData, clientDataFields, r, s)`, but Safe expects a specific contract signature layout. The backend handles that translation — packs the WebAuthn assertion into Safe's `isValidSignature()` format and submits through a relayer that pays gas for the user.

**Repos:**
- Frontend (Expo / React Native): https://github.com/whitzytraiding-max/safe-wallet-expo
- Backend (Node.js relayer on Vercel): https://github.com/whitzytraiding-max/safe-wallet-backend

**Deployed contracts on Arbitrum Sepolia:**
- Safe: `0xc1b2cDF1AC825fa985589656cB3Ed9E4c0cD40A5` → https://sepolia.arbiscan.io/address/0xc1b2cDF1AC825fa985589656cB3Ed9E4c0cD40A5
- WebAuthn Signer: `0xa6aF98f9AD843D4628071ACD9282a9a0ac79C024`
- Relayer: `0xFA9a9b33BaEc45A765544a9B2645189d12a05255`

**Backend:** https://backend-whitzy.vercel.app (live, returns real Sepolia balances)

Demo video attached. The recording uses `EXPO_PUBLIC_DEMO=true` since WebAuthn needs a real device (Secure Enclave isn't in the simulator), but the passkey flow works end-to-end on a physical iPhone.

A few things I'd close out before this went to production: the RP ID is currently hardcoded to `awakensystem.app` — it'd need its own domain. There's no transaction history indexer yet (needs The Graph or Alchemy). And the account recovery story needs work — right now if someone loses their passkey and it's not in iCloud Keychain, they lose access. The fix is adding a guardian as a second Safe owner from the start.

Happy to walk through any part of it.

Michael
