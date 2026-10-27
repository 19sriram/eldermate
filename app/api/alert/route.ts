import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getNotifier } from "@/lib/notifier";
import { isRateLimited } from "@/lib/ratelimit";
import { hashIp, hashToken, isWellFormedToken } from "@/lib/token";

const MESSAGES = {
  PACKAGE: "A package/delivery notice was left at your tag.",
  EMERGENCY: "Someone scanning your tag says they need help or found your person.",
} as const;

// Unknown, revoked and rate-limited cases all return this, so the response
// never reveals whether a token maps to a real tag.
const SUPPRESSED = { ok: true, status: "already_notified" } as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const type = body?.type === "PACKAGE" || body?.type === "EMERGENCY" ? body.type : null;
  const note = typeof body?.note === "string" ? body.note.slice(0, 200) : "";

  if (!type || !isWellFormedToken(token)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const tag = await db.tag.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { contacts: { orderBy: { priority: "asc" } } },
  });
  if (!tag || !tag.active) return NextResponse.json(SUPPRESSED);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ipHash = hashIp(ip);
  if (await isRateLimited(tag.id, type, ipHash)) return NextResponse.json(SUPPRESSED);

  const notifier = getNotifier();
  const text = `${MESSAGES[type as keyof typeof MESSAGES]}${note ? ` Note: "${note}"` : ""} (tag: ${tag.label})`;
  const deliveries = await Promise.all(
    tag.contacts.map(async (c) => {
      try {
        await notifier.send({ name: c.name, phone: c.phone }, text);
        return { contactId: c.id, ok: true };
      } catch {
        return { contactId: c.id, ok: false };
      }
    }),
  );
  await db.alertEvent.create({ data: { tagId: tag.id, type, note, ipHash, deliveries } });

  return NextResponse.json({ ok: true, status: "sent" });
}
