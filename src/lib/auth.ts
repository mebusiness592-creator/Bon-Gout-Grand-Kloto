import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "bg_admin_session";
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET doit contenir au moins 32 caractères.");
  return new TextEncoder().encode(value);
}
export async function createSession() {
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("8h").sign(secret());
  const jar = await cookies();
  jar.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}
export async function isAdmin() {
  try {
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch { return false; }
}
export async function destroySession() {
  const jar = await cookies();
  jar.set(cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
}
