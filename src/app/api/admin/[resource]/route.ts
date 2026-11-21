import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { guard, json } from "@/lib/guard";
import { prepare } from "@/lib/resources";

export async function POST(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const db = await getDb();
  const r = await prepare((await ctx.params).resource, await req.json().catch(() => null), "create", db);
  if ("error" in r) return json({ error: r.error }, 400);
  const res = await db.collection(r.def.collection).insertOne(r.doc);
  return json({ ok: true, id: res.insertedId.toString() });
}
