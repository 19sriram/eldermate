import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "em_session";
const MAX_AGE_S = 60 * 60 * 24 * 14;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function makeSessionValue(ownerId: string): string {
  const payload = `${ownerId}.${Date.now() + MAX_AGE_S * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(value: string | undefined): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [ownerId, exp, sig] = parts;
  const expected = sign(`${ownerId}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  return ownerId;
}

export async function setSession(ownerId: string) {
  (await cookies()).set(COOKIE, makeSessionValue(ownerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getOwner() {
  const id = readSessionValue((await cookies()).get(COOKIE)?.value);
  return id ? db.owner.findUnique({ where: { id } }) : null;
}
