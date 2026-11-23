import { NextRequest } from "next/server";
import { getDb, oid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";

export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Connexion requise." }, 401);
  await (await getDb()).collection("notifications").updateMany({ audience: "user", userId: user.id, read: false }, { $set: { read: true } });
  return json({ ok: true });
}
/** Le client supprime lui-même un message (id) ou tout son historique (all). */
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Connexion requise." }, 401);
  const body = await req.json().catch(() => ({}));
  const col = (await getDb()).collection("notifications");
  if (body.all === true) { await col.deleteMany({ audience: "user", userId: user.id }); return json({ ok: true }); }
  const _id = oid(body.id);
  if (!_id) return json({ error: "Requête invalide." }, 400);
  await col.deleteOne({ _id, audience: "user", userId: user.id });
  return json({ ok: true });
}
