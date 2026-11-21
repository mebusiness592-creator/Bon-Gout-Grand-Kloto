import { NextRequest } from "next/server";
import { getDb, oid } from "@/lib/db";
import { guard, json } from "@/lib/guard";

export async function PATCH(req: NextRequest) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const body = await req.json().catch(() => ({}));
  const db = await getDb();
  if (body.all === true) { await db.collection("notifications").updateMany({ audience: { $ne: "user" }, read: false }, { $set: { read: true } }); return json({ ok: true }); }
  const _id = oid(body.id);
  if (!_id) return json({ error: "Requête invalide." }, 400);
  await db.collection("notifications").updateOne({ _id, audience: { $ne: "user" } }, { $set: { read: true } });
  return json({ ok: true });
}
