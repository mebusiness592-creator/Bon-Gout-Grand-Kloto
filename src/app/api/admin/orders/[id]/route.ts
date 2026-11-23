import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb, oid } from "@/lib/db";
import { guard, json } from "@/lib/guard";
import { notify } from "@/lib/notify";
import { DELIVERY_STATUS, ORDER_STATUS, PAYMENT_STATUS } from "@/lib/labels";

const schema = z.object({
  status: z.enum(Object.keys(ORDER_STATUS) as [string, ...string[]]).optional(),
  paymentStatus: z.enum(Object.keys(PAYMENT_STATUS).filter((k) => k !== "unpaid") as [string, ...string[]]).optional(),
  deliveryStatus: z.enum(Object.keys(DELIVERY_STATUS) as [string, ...string[]]).optional(),
  note: z.string().trim().max(300).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const _id = oid((await ctx.params).id);
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!_id || !p.success) return json({ error: "Requête invalide." }, 400);
  const db = await getDb();
  const order = await db.collection("orders").findOne({ _id });
  if (!order) return json({ error: "Commande introuvable." }, 404);

  const d = p.data;
  // cohérence livraison -> statut général lorsque le statut n'est pas fourni explicitement
  if (!d.status && d.deliveryStatus === "in_delivery" && order.status !== "cancelled") d.status = "delivering";
  if (!d.status && d.deliveryStatus === "delivered" && order.status !== "cancelled") d.status = "delivered";

  const set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  const history: Record<string, unknown>[] = [];
  const now = new Date().toISOString();
  for (const f of ["status", "paymentStatus", "deliveryStatus"] as const) {
    const to = d[f];
    const from = (order[f] as string | undefined) ?? (f === "deliveryStatus" ? "to_prepare" : undefined);
    if (to && to !== from) { set[f] = to; history.push({ at: now, by: g.user.email, field: f, from, to, note: d.note || undefined }); }
  }
  if (set.paymentStatus === "paid") set.paidAt = now;
  if (!history.length && d.note) history.push({ at: now, by: g.user.email, field: "note", to: d.note });
  if (!history.length) return json({ ok: true, unchanged: true });

  await db.collection("orders").updateOne({ _id }, { $set: set, $push: { history: { $each: history } } as never });

  // remise en stock si la commande est annulée
  if (set.status === "cancelled" && order.status !== "cancelled") {
    for (const it of (order.items || []) as { productId: string; quantity: number }[]) {
      const pid = oid(it.productId);
      if (pid) await db.collection("products").updateOne({ _id: pid, stock: { $type: "number" } }, { $inc: { stock: it.quantity } });
    }
  }
  if (order.userId) {
    const parts: string[] = [];
    if (set.status) parts.push(`statut : ${ORDER_STATUS[set.status as string]}`);
    if (set.paymentStatus) parts.push(`paiement : ${PAYMENT_STATUS[set.paymentStatus as string]}`);
    if (set.deliveryStatus) parts.push(`livraison : ${DELIVERY_STATUS[set.deliveryStatus as string]}`);
    if (parts.length) await notify({ audience: "user", userId: order.userId, title: `Commande ${order.reference}`, message: parts.join(" · "), orderId: _id.toString(), type: "order" });
  }
  return json({ ok: true });
}

