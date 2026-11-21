import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "./db";
import type { AppUser, Role } from "./types";

const COOKIE = "bg_session";
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET doit contenir au moins 32 caractères.");
  return new TextEncoder().encode(value);
}
export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("7d").sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 3600 });
}
export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
/** Lit la session puis recharge l'utilisateur depuis MongoDB : le rôle utilisé est toujours celui de la base. */
export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    const uid = String(payload.uid || "");
    if (!ObjectId.isValid(uid)) return null;
    const u = await (await getDb()).collection("users").findOne({ _id: new ObjectId(uid) });
    if (!u || u.active === false) return null;
    return {
      id: u._id.toString(), firstName: u.firstName || "", lastName: u.lastName || "", email: u.email,
      phone: u.phone || "", role: (u.role as Role) || "customer", address: u.address || "", city: u.city || "",
    };
  } catch {
    return null;
  }
}
