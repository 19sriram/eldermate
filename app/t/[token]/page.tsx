import { db } from "@/lib/db";
import { hashToken, isWellFormedToken } from "@/lib/token";
import AlertButtons from "./AlertButtons";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ScanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Unknown, revoked and valid tokens render the same shell; only the owner's
  // public message differs. Nothing about contacts or the owner is ever loaded.
  const tag = isWellFormedToken(token)
    ? await db.tag.findUnique({
        where: { tokenHash: hashToken(token) },
        select: { publicMessage: true, active: true },
      })
    : null;
  const message = tag?.active ? tag.publicMessage : "";

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h1>ElderMate</h1>
      <p>{message || "You scanned a safety tag. Choose what you'd like to do."}</p>
      <AlertButtons token={token} />
    </main>
  );
}
