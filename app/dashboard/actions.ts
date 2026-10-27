"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { renderQr } from "@/lib/qr";
import { normalizePhone } from "@/lib/otp";
import { clearSession, getOwner } from "@/lib/session";
import { encryptToken, generateToken, hashToken } from "@/lib/token";

async function requireOwner() {
  const owner = await getOwner();
  if (!owner) redirect("/login");
  return owner;
}

async function requireOwnedTag(tagId: string) {
  const owner = await requireOwner();
  const tag = await db.tag.findFirst({ where: { id: tagId, ownerId: owner.id } });
  if (!tag) throw new Error("Not found");
  return tag;
}

export type QrState = { qrSvg?: string; url?: string; error?: string } | null;

// The DB keeps the lookup hash plus an encrypted copy for re-display.
export async function createTag(_prev: QrState, form: FormData): Promise<QrState> {
  const owner = await requireOwner();
  const label = String(form.get("label") ?? "").trim().slice(0, 80);
  if (!label) return { error: "Label required" };
  const token = generateToken();
  await db.tag.create({ data: { ownerId: owner.id, label, tokenHash: hashToken(token), tokenEnc: encryptToken(token) } });
  revalidatePath("/dashboard");
  return renderQr(token);
}

export async function rotateTag(_prev: QrState, form: FormData): Promise<QrState> {
  const tag = await requireOwnedTag(String(form.get("tagId")));
  const token = generateToken();
  await db.tag.update({ where: { id: tag.id }, data: { tokenHash: hashToken(token), tokenEnc: encryptToken(token), active: true } });
  revalidatePath("/dashboard");
  return renderQr(token);
}

export async function setTagActive(form: FormData) {
  const tag = await requireOwnedTag(String(form.get("tagId")));
  await db.tag.update({ where: { id: tag.id }, data: { active: form.get("active") === "true" } });
  revalidatePath("/dashboard");
}

export async function updateMessage(form: FormData) {
  const tag = await requireOwnedTag(String(form.get("tagId")));
  const publicMessage = String(form.get("publicMessage") ?? "").slice(0, 280);
  await db.tag.update({ where: { id: tag.id }, data: { publicMessage } });
  revalidatePath("/dashboard");
}

export async function addContact(form: FormData) {
  const tag = await requireOwnedTag(String(form.get("tagId")));
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  if (!name || !phone) return;
  const count = await db.contact.count({ where: { tagId: tag.id } });
  await db.contact.create({ data: { tagId: tag.id, name, phone, priority: count } });
  revalidatePath("/dashboard");
}

export async function removeContact(form: FormData) {
  const owner = await requireOwner();
  await db.contact.deleteMany({
    where: { id: String(form.get("contactId")), tag: { ownerId: owner.id } },
  });
  revalidatePath("/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
