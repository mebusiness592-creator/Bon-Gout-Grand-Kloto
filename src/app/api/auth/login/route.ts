import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { json, sameOrigin, tooMany } from "@/lib/guard";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password || password.length > 72) return json({ error: "Identifiants incorrects." }, 401);
  if (tooMany("login:" + email + ":" + (req.headers.get("x-forwarded-for") || "ip"))) return json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, 429);
  try {
    const u = await (await getDb()).collection("users").findOne({ email });
    const ok = u && u.active !== false && await bcrypt.compare(password, u.passwordHash || "");
    if (!u || !ok) return json({ error: "Identifiants incorrects." }, 401);
    await createSession(u._id.toString());
    return json({ ok: true, role: u.role || "customer" });
  } catch {
    return json({ error: "Connexion impossible pour le moment." }, 500);
  }
}
