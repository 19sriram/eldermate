import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone, verifyOtp } from "@/lib/otp";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = normalizePhone(String(body?.phone ?? ""));
  const code = String(body?.code ?? "");
  if (!phone || !/^\d{6}$/.test(code) || !(await verifyOtp(phone, code))) {
    return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
  }
  const owner = await db.owner.upsert({ where: { phone }, update: {}, create: { phone } });
  await setSession(owner.id);
  return NextResponse.json({ ok: true });
}
