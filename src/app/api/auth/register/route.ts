import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { json, sameOrigin, tooMany } from "@/lib/guard";
import { notify } from "@/lib/notify";

const schema = z.object({
  lastName: z.string().trim().min(2, "Nom trop court.").max(60),
  firstName: z.string().trim().min(2, "Prénom trop court.").max(60),
  phone: z.string().trim().regex(/^[+0-9\s().-]{6,20}$/, "Numéro de téléphone invalide."),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(120),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.").max(72),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Les mots de passe ne correspondent pas.", path: ["confirmPassword"] });

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  if (tooMany("reg:" + (req.headers.get("x-forwarded-for") || "ip"), 10)) return json({ error: "Trop de tentatives. Réessayez plus tard." }, 429);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || "Données invalides." }, 400);
  const d = parsed.data;
  try {
    const db = await getDb();
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    if (await db.collection("users").findOne({ email: d.email })) return json({ error: "Un compte existe déjà avec cet e-mail." }, 409);
    // Le rôle n'est jamais lu depuis la requête : tout nouveau compte est « customer ».
    const res = await db.collection("users").insertOne({
      firstName: d.firstName, lastName: d.lastName, phone: d.phone, email: d.email,
      passwordHash: await bcrypt.hash(d.password, 12), role: "customer", active: true, createdAt: new Date().toISOString(),
    });
    await createSession(res.insertedId.toString());
    await notify({ audience: "admin", title: "Nouvelle inscription", message: `${d.firstName} ${d.lastName} (${d.email})`, type: "user" });
    return json({ ok: true, role: "customer" });
  } catch {
    return json({ error: "Inscription impossible pour le moment." }, 500);
  }
}
