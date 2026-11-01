Subject: Safe Wallet challenge

Hi Tom,

Built the Safe wallet with passkey auth. Face ID/fingerprint creates the wallet, no seed phrase. The P-256 key lives in the device's Secure Enclave (iOS) or Android Keystore (Android), and a SafeWebAuthnSigner contract acts as the Safe owner on Arbitrum Sepolia.

Main challenge was getting the WebAuthn signature into Safe's contract signature format. The backend handles that and pays gas via a relayer.

Frontend: github.com/whitzytraiding-max/safe-wallet-expo
Backend: github.com/whitzytraiding-max/safe-wallet-backend
Live Safe: 0xc1b2cDF1AC825fa985589656cB3Ed9E4c0cD40A5 (Arbiscan)

Demo video attached. Uses mock data since WebAuthn needs a real device.

Please let me know if you want anything else. I can also add you to the TestFlight build so you can try the actual app on your phone.

Michael
