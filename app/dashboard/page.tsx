import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { renderQr } from "@/lib/qr";
import { getOwner } from "@/lib/session";
import { decryptToken } from "@/lib/token";
import {
  addContact, createTag, logout, removeContact, rotateTag, setTagActive, updateMessage,
} from "./actions";
import QrForm from "./QrForm";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const owner = await getOwner();
  if (!owner) redirect("/login");

  const tags = await db.tag.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    include: {
      contacts: { orderBy: { priority: "asc" } },
      alerts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const qrs = new Map<string, string>();
  for (const t of tags) {
    if (!t.tokenEnc) continue;
    try {
      qrs.set(t.id, (await renderQr(decryptToken(t.tokenEnc))).qrSvg);
    } catch {
      // key changed or data corrupt: owner can re-issue
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Your tags</h1>
        <form action={logout}><button>Sign out ({owner.phone})</button></form>
      </header>

      <section>
        <h2>New tag</h2>
        <QrForm action={createTag} submitLabel="Generate QR" withLabel />
      </section>

      {tags.map((t) => (
        <section key={t.id} style={{ borderTop: "1px solid #ccc", marginTop: 24, paddingTop: 12 }}>
          <h2>{t.label} {!t.active && "(disabled)"}</h2>

          <form action={updateMessage} style={{ display: "flex", gap: 8 }}>
            <input type="hidden" name="tagId" value={t.id} />
            <input name="publicMessage" defaultValue={t.publicMessage} placeholder="Message shown to scanners" style={{ flex: 1 }} />
            <button>Save message</button>
          </form>

          {qrs.has(t.id) ? (
            <div>
              <div style={{ width: 200 }} dangerouslySetInnerHTML={{ __html: qrs.get(t.id)! }} />
              <a
                download={`${t.label.replace(/[^\w-]+/g, "_")}-qr.svg`}
                href={`data:image/svg+xml;utf8,${encodeURIComponent(qrs.get(t.id)!)}`}
              >
                Download QR
              </a>
            </div>
          ) : (
            <p>No saved QR for this tag. Use &quot;Re-issue QR&quot; below.</p>
          )}

          <h3>Contacts (alerted in this order)</h3>
          <ul>
            {t.contacts.map((c) => (
              <li key={c.id}>
                {c.name} {c.phone}
                <form action={removeContact} style={{ display: "inline" }}>
                  <input type="hidden" name="contactId" value={c.id} />
                  <button>Remove</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={addContact} style={{ display: "flex", gap: 8 }}>
            <input type="hidden" name="tagId" value={t.id} />
            <input name="name" placeholder="Name" required />
            <input name="phone" placeholder="+14155550123" required />
            <button>Add contact</button>
          </form>

          <h3>Recent alerts</h3>
          <ul>
            {t.alerts.map((a) => (
              <li key={a.id}>{a.createdAt.toISOString()} {a.type} {a.note && `"${a.note}"`}</li>
            ))}
            {t.alerts.length === 0 && <li>None yet</li>}
          </ul>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <QrForm action={rotateTag} submitLabel="Re-issue QR (invalidates old)" hidden={{ tagId: t.id }} />
            <form action={setTagActive}>
              <input type="hidden" name="tagId" value={t.id} />
              <input type="hidden" name="active" value={String(!t.active)} />
              <button>{t.active ? "Disable tag" : "Enable tag"}</button>
            </form>
          </div>
        </section>
      ))}
    </main>
  );
}
