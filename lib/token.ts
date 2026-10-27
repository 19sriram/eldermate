import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// 128-bit random, base64url. Carries no user or phone data.
export function generateToken(): string {
  return randomBytes(16).toString("base64url");
}

// Only the hash is stored, so a DB leak cannot reconstruct QR URLs.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isWellFormedToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{22}$/.test(token);
}

export function hashIp(ip: string): string {
  const salt = process.env.SESSION_SECRET ?? "";
  return createHash("sha256").update(salt + ip).digest("hex");
}

// Encrypted-at-rest copy of the token (key lives in env, not the DB), so a DB
// leak alone cannot reconstruct QR URLs but owners can still re-download them.
function encKey(): Buffer {
  const k = process.env.TOKEN_ENC_KEY;
  if (!k) throw new Error("TOKEN_ENC_KEY is not set");
  const key = Buffer.from(k, "base64");
  if (key.length !== 32) throw new Error("TOKEN_ENC_KEY must be 32 bytes, base64");
  return key;
}

export function encryptToken(token: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", encKey(), iv);
  const ct = Buffer.concat([c.update(token, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64url");
}

export function decryptToken(enc: string): string {
  const buf = Buffer.from(enc, "base64url");
  const d = createDecipheriv("aes-256-gcm", encKey(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}
