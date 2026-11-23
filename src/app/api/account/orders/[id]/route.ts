import { NextRequest } from "next/server";
import { getDb, oid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";

/** Retire une commande terminée ou annulée de l'historique du client (elle reste visible pour la gestion du restaurant). */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Connexion requise." }, 401);
  const _id = oid((await ctx.params).id);
  if (!_id) return json({ error: "Commande introuvable." }, 404);
  const db = await getDb();
  const order = await db.collection("orders").findOne({ _id, userId: user.id });
  if (!order) return json({ error: "Commande introuvable." }, 404);
  if (!["delivered", "cancelled"].includes(order.status)) return json({ error: "Vous pourrez supprimer cette commande une fois qu'elle sera livrée ou annulée." }, 400);
  await db.collection("orders").updateOne({ _id }, { $set: { hiddenByUser: true } });
  return json({ ok: true });
}
