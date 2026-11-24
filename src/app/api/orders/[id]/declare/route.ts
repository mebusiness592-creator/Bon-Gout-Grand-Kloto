import { NextRequest } from "next/server";
import { getDb, oid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";
import { notify } from "@/lib/notify";

/** Le client déclare avoir lancé le paiement. Cela ne valide PAS le paiement : statut « en attente de vérification ». */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const _id = oid((await ctx.params).id);
  if (!_id) return json({ error: "Commande introuvable." }, 404);
  const body = await req.json().catch(() => ({}));
  const db = await getDb();
  const order = await db.collection("orders").findOne({ _id });
  const user = await getCurrentUser();
  const allowed = order && (order.accessToken === String(body.token || "") || (user && order.userId === user.id));
  if (!order || !allowed) return json({ error: "Commande introuvable." }, 404);
  if (order.paymentMethod !== "ussd" || order.paymentStatus !== "pending") return json({ error: "Action non applicable à cette commande." }, 400);
  const operator = body.operator === "TMoney" || body.operator === "Flooz" ? body.operator : order.operator;
  await db.collection("orders").updateOne({ _id }, {
    $set: { paymentStatus: "awaiting_verification", operator },
    $push: { history: { at: new Date().toISOString(), by: "client", field: "paymentStatus", from: "pending", to: "awaiting_verification" } } as never,
  });
  await notify({ audience: "admin", title: "Paiement à vérifier", message: `Le client annonce un paiement pour ${order.reference}.`, orderId: _id.toString(), type: "payment", image: (order.items?.[0] as { image?: string } | undefined)?.image || null });
  return json({ ok: true });
}
