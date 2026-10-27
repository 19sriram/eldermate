import type { AlertType } from "@prisma/client";
import { db } from "./db";

const TAG_WINDOW_MS = 5 * 60 * 1000;
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_MAX_PER_WINDOW = 10;

// DB-backed for now; swap for Redis if volume grows.
export async function isRateLimited(tagId: string, type: AlertType, ipHash: string) {
  const [tagHits, ipHits] = await Promise.all([
    db.alertEvent.count({
      where: { tagId, type, createdAt: { gt: new Date(Date.now() - TAG_WINDOW_MS) } },
    }),
    db.alertEvent.count({
      where: { ipHash, createdAt: { gt: new Date(Date.now() - IP_WINDOW_MS) } },
    }),
  ]);
  return tagHits > 0 || ipHits >= IP_MAX_PER_WINDOW;
}
