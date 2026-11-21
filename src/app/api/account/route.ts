import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";

const schema = z.object({
  firstName: z.string().trim().min(2).max(60), lastName: z.string().trim().min(2).max(60),
  phone: z.string().trim().regex(/^[+0-9\s().-]{6,20}$/), address: z.string().trim().max(300).optional(), city: z.string().trim().max(100).optional(),
  currentPassword: z.string().max(72).optional(), newPassword: z.string().min(8).max(72).optional(),
});
export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Connexion requise." }, 401);
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return json({ error: "Informations invalides." }, 400);
  const d = p.data;
  const db = await getDb();
  const set: Record<string, unknown> = { firstName: d.firstName, lastName: d.lastName, phone: d.phone, address: d.address || "", city: d.city || "" };
  if (d.newPassword) {
    const u = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
    if (!d.currentPassword || !u || !(await bcrypt.compare(d.currentPassword, u.passwordHash || ""))) return json({ error: "Mot de passe actuel incorrect." }, 400);
    set.passwordHash = await bcrypt.hash(d.newPassword, 12);
  }
  // le rôle et l'e-mail ne sont jamais modifiables ici
  await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: set });
  return json({ ok: true });
}
