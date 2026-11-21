import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb, oid } from "@/lib/db";
import { guard, json } from "@/lib/guard";

const schema = z.object({ role: z.enum(["customer", "staff", "admin"]).optional(), active: z.boolean().optional(), newPassword: z.string().min(8).max(72).optional() });

/** Seul un administrateur (rôle relu en base) peut modifier rôles, activation et mots de passe. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard(req, ["admin"]);
  if ("error" in g) return g.error;
  const _id = oid((await ctx.params).id);
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!_id || !p.success) return json({ error: "Requête invalide." }, 400);
  if (_id.toString() === g.user.id && (p.data.role !== undefined || p.data.active !== undefined)) return json({ error: "Vous ne pouvez pas modifier votre propre rôle ou statut." }, 400);
  const set: Record<string, unknown> = {};
  if (p.data.role) set.role = p.data.role;
  if (p.data.active !== undefined) set.active = p.data.active;
  if (p.data.newPassword) set.passwordHash = await bcrypt.hash(p.data.newPassword, 12);
  if (!Object.keys(set).length) return json({ ok: true });
  const r = await (await getDb()).collection("users").updateOne({ _id }, { $set: set });
  return r.matchedCount ? json({ ok: true }) : json({ error: "Utilisateur introuvable." }, 404);
}
