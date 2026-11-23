import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";

const schema = z.object({
  firstName: z.string().trim().min(2).max(60).optional(), lastName: z.string().trim().min(2).max(60).optional(),
  phone: z.string().trim().regex(/^[+0-9\s().-]{6,20}$/).optional(), address: z.string().trim().max(300).optional(), city: z.string().trim().max(100).optional(),
  avatar: z.string().max(600).optional(),
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
  const set: Record<string, unknown> = {};
  for (const k of ["firstName", "lastName", "phone", "address", "city"] as const) if (d[k] !== undefined) set[k] = d[k];
  if (d.avatar !== undefined) {
    const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
    if (d.avatar !== "" && !d.avatar.startsWith(prefix)) return json({ error: "Photo invalide." }, 400);
    set.avatar = d.avatar;
  }
  if (d.newPassword) {
    const u = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
    if (!d.currentPassword || !u || !(await bcrypt.compare(d.currentPassword, u.passwordHash || ""))) return json({ error: "Mot de passe actuel incorrect." }, 400);
    set.passwordHash = await bcrypt.hash(d.newPassword, 12);
  }
  // le rôle et l'e-mail ne sont jamais modifiables ici
  if (Object.keys(set).length) await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: set });
  return json({ ok: true });
}
