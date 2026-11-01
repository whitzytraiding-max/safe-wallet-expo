import { Passkey, PasskeyCreateResult, PasskeyGetResult } from 'react-native-passkey';
import { Buffer } from 'buffer';

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO === 'true';

const RP_ID = 'awakensystem.app';
const RP_NAME = 'Safe Wallet';

function toBase64url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(b64url: string): Buffer {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (b64.length % 4)) % 4;
  return Buffer.from(b64 + '='.repeat(pad), 'base64');
}

function randomBase64url(): string {
  const bytes = new Uint8Array(32);
  // Use crypto.getRandomValues for cryptographically secure randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return toBase64url(Buffer.from(bytes).toString('base64'));
}

function stringToBase64url(str: string): string {
  return toBase64url(Buffer.from(str).toString('base64'));
}

export interface PasskeyResult {
  credentialId: string;
  pubkeyX: string;
  pubkeyY: string;
  rawResponse: PasskeyCreateResult;
}

export interface PasskeyAssertionResult {
  credentialId: string;
  rawResponse: PasskeyGetResult;
}

export interface ParsedAssertion {
  authenticatorData: string; // 0x-prefixed hex
  clientDataFields: string;  // JSON suffix after challenge value
  r: string;                 // decimal string
  s: string;                 // decimal string
}

export async function createPasskey(userId: string): Promise<PasskeyResult> {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 3200));
    return {
      credentialId: 'demo-cred-' + userId,
      pubkeyX: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      pubkeyY: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      rawResponse: {} as PasskeyCreateResult,
    };
  }
  const result = await Passkey.create({
    challenge: randomBase64url(),
    rp: { id: RP_ID, name: RP_NAME },
    user: {
      id: stringToBase64url(userId),
      name: `user-${userId.slice(-8)}`,
      displayName: 'Safe Wallet User',
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      residentKey: 'required',
      userVerification: 'required',
    },
  });

  const { pubkeyX, pubkeyY } = extractPublicKey(result);
  return { credentialId: result.id, pubkeyX, pubkeyY, rawResponse: result };
}

export async function authenticatePasskey(credentialId?: string): Promise<PasskeyAssertionResult> {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 600));
    return { credentialId: credentialId ?? 'demo-cred', rawResponse: {} as PasskeyGetResult };
  }
  const result = await Passkey.get({
    challenge: randomBase64url(),
    rpId: RP_ID,
    timeout: 60000,
    userVerification: 'required',
    ...(credentialId
      ? { allowCredentials: [{ type: 'public-key', id: credentialId }] }
      : {}),
  });
  return { credentialId: result.id, rawResponse: result };
}

// Parse a WebAuthn assertion into the fields Safe's WebAuthnSigner contract expects
export function parseAssertion(result: PasskeyGetResult): ParsedAssertion {
  const authenticatorData = '0x' + fromBase64url(result.response.authenticatorData).toString('hex');
  const clientDataFields = extractClientDataFields(result.response.clientDataJSON);
  const { r, s } = parseDerSignature(result.response.signature);
  return { authenticatorData, clientDataFields, r, s };
}

function extractClientDataFields(clientDataJSONb64url: string): string {
  const json = fromBase64url(clientDataJSONb64url).toString('utf8');
  // clientDataJSON = {"type":"webauthn.get","challenge":"<b64url>","origin":"..."}
  // Safe's signer reconstructs it as: prefix + challenge + clientDataFields
  // So we need everything after the challenge value
  const match = json.match(/"challenge":"[^"]*"(.*)/s);
  if (!match) throw new Error('clientDataJSON missing challenge field');
  return match[1]; // e.g. ,"origin":"https://awakensystem.app","crossOrigin":false}
}

function parseDerSignature(sigB64url: string): { r: string; s: string } {
  const der = fromBase64url(sigB64url);
  // DER format: 30 <totalLen> 02 <rLen> <r> 02 <sLen> <s>
  let offset = 2; // skip 0x30 and total length
  if (der[offset] !== 0x02) throw new Error('Invalid DER signature: expected 0x02');
  offset += 1;
  const rLen = der[offset++];
  const rBytes = der.slice(offset, offset + rLen);
  offset += rLen;
  if (der[offset] !== 0x02) throw new Error('Invalid DER signature: expected 0x02 for s');
  offset += 1;
  const sLen = der[offset++];
  const sBytes = der.slice(offset, offset + sLen);

  // Strip leading 0x00 padding byte (added when high bit is set in DER)
  const rHex = Buffer.from(rBytes[0] === 0 ? rBytes.slice(1) : rBytes).toString('hex');
  const sHex = Buffer.from(sBytes[0] === 0 ? sBytes.slice(1) : sBytes).toString('hex');

  return {
    r: BigInt('0x' + rHex).toString(),
    s: BigInt('0x' + sHex).toString(),
  };
}

function extractPublicKey(result: PasskeyCreateResult): { pubkeyX: string; pubkeyY: string } {
  try {
    const authDataB64url = result.response.authenticatorData
      ?? extractAuthDataFromAttestation(result.response.attestationObject);
    if (!authDataB64url) throw new Error('no authData');

    const authData = fromBase64url(authDataB64url);
    // authData layout: rpIdHash(32) + flags(1) + signCount(4) + aaguid(16) + credIdLen(2) + credId + coseKey
    let offset = 37;
    offset += 16; // aaguid
    const credIdLen = (authData[offset] << 8) | authData[offset + 1];
    offset += 2 + credIdLen;

    const coseKey = authData.slice(offset);
    const x = findCoseCoord(coseKey, 0x21);
    const y = findCoseCoord(coseKey, 0x22);

    if (!x || !y) throw new Error('coords not found');
    return { pubkeyX: '0x' + x, pubkeyY: '0x' + y };
  } catch {
    return { pubkeyX: '0x' + '00'.repeat(32), pubkeyY: '0x' + '00'.repeat(32) };
  }
}

function findCoseCoord(buf: Buffer, negKey: number): string | null {
  for (let i = 0; i < buf.length - 34; i++) {
    if (buf[i] === negKey && buf[i + 1] === 0x58 && buf[i + 2] === 0x20) {
      return buf.slice(i + 3, i + 35).toString('hex');
    }
  }
  return null;
}

function extractAuthDataFromAttestation(attestationObject: string): string | null {
  try {
    const bytes = fromBase64url(attestationObject);
    const key = Buffer.from([0x68, 0x61, 0x75, 0x74, 0x68, 0x44, 0x61, 0x74, 0x61]);
    for (let i = 0; i < bytes.length - key.length - 4; i++) {
      let match = true;
      for (let j = 0; j < key.length; j++) {
        if (bytes[i + j] !== key[j]) { match = false; break; }
      }
      if (!match) continue;
      let p = i + key.length;
      const mt = bytes[p] >> 5;
      if (mt !== 2) continue;
      const lenByte = bytes[p] & 0x1f;
      let len: number;
      if (lenByte <= 23) { len = lenByte; p += 1; }
      else if (lenByte === 24) { len = bytes[p + 1]; p += 2; }
      else if (lenByte === 25) { len = (bytes[p + 1] << 8) | bytes[p + 2]; p += 3; }
      else continue;
      return toBase64url(bytes.slice(p, p + len).toString('base64'));
    }
    return null;
  } catch {
    return null;
  }
}

export function isPasskeySupported(): boolean {
  return Passkey.isSupported();
}
