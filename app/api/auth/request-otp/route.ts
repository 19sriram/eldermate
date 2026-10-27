import { NextResponse } from "next/server";
import { issueOtp, normalizePhone } from "@/lib/otp";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = normalizePhone(String(body?.phone ?? ""));
  if (!phone) return NextResponse.json({ ok: false, error: "Use international format, e.g. +14155550123" }, { status: 400 });
  await issueOtp(phone);
  return NextResponse.json({ ok: true });
}
