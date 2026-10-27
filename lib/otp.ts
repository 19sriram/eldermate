import { createHash, randomInt } from "node:crypto";
import { db } from "./db";

const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function normalizePhone(raw: string): string | null {
  const p = raw.replace(/[\s()-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(p) ? p : null;
}

const hashCode = (phone: string, code: string) =>
  createHash("sha256").update(`${phone}:${code}`).digest("hex");

export async function issueOtp(phone: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.otpChallenge.deleteMany({ where: { phone } });
  await db.otpChallenge.create({
    data: { phone, codeHash: hashCode(phone, code), expiresAt: new Date(Date.now() + TTL_MS) },
  });
  // Console delivery for now; route through the Notifier once SMS exists.
  console.log(`[otp] ${phone}: ${code}`);
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const ch = await db.otpChallenge.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (!ch || ch.expiresAt < new Date() || ch.attempts >= MAX_ATTEMPTS) return false;
  if (ch.codeHash !== hashCode(phone, code)) {
    await db.otpChallenge.update({ where: { id: ch.id }, data: { attempts: { increment: 1 } } });
    return false;
  }
  await db.otpChallenge.delete({ where: { id: ch.id } });
  return true;
}
