import { NextRequest } from "next/server";
import { getDb, oid } from "@/lib/db";
import { guard, json } from "@/lib/guard";
import { prepare, RESOURCES } from "@/lib/resources";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const { resource, id } = await ctx.params;
  const _id = oid(id);
  if (!_id) return json({ error: "Identifiant invalide." }, 400);
  const db = await getDb();
  const r = await prepare(resource, await req.json().catch(() => null), "update", db);
  if ("error" in r) return json({ error: r.error }, 400);
  // l'update ne peut pas changer la section d'un produit ; on restreint au bon type
  const filter: Record<string, unknown> = { _id };
  if (r.def.section) filter.section = r.def.section;
  const res = await db.collection(r.def.collection).updateOne(filter, { $set: r.doc });
  return res.matchedCount ? json({ ok: true }) : json({ error: "Élément introuvable." }, 404);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const { resource, id } = await ctx.params;
  const def = RESOURCES[resource];
  const _id = oid(id);
  if (!def || !_id) return json({ error: "Requête invalide." }, 400);
  const db = await getDb();
  const filter: Record<string, unknown> = { _id };
  if (def.section) filter.section = def.section;
  const res = await db.collection(def.collection).deleteOne(filter);
  if (def.collection === "categories") await db.collection("products").updateMany({ categoryId: _id }, { $set: { categoryId: null } });
  return res.deletedCount ? json({ ok: true }) : json({ error: "Élément introuvable." }, 404);
}
