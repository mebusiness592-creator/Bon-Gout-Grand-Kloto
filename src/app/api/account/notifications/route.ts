import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";

export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Connexion requise." }, 401);
  await (await getDb()).collection("notifications").updateMany({ audience: "user", userId: user.id, read: false }, { $set: { read: true } });
  return json({ ok: true });
}
