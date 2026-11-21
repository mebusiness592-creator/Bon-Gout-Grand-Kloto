import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import type { AppUser, Role } from "./types";

export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.get("host"); } catch { return false; }
}
export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

/** Contrôle côté serveur : origine, session, rôle lu en base. */
export async function guard(req: NextRequest, roles: Role[] = ["admin", "staff"]): Promise<{ user: AppUser } | { error: NextResponse }> {
  if (!sameOrigin(req)) return { error: json({ error: "Origine refusée." }, 403) };
  const user = await getCurrentUser();
  if (!user) return { error: json({ error: "Connexion requise." }, 401) };
  if (!roles.includes(user.role)) return { error: json({ error: "Accès refusé." }, 403) };
  return { user };
}

const attempts = new Map<string, { n: number; t: number }>();
/** Limite simple (par instance serveur) des tentatives de connexion. */
export function tooMany(key: string, max = 8, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const e = attempts.get(key);
  if (!e || now - e.t > windowMs) { attempts.set(key, { n: 1, t: now }); return false; }
  e.n += 1;
  return e.n > max;
}
