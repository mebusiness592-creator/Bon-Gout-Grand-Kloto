import { NextRequest } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getDb, oid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin, tooMany } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import { effectivePrice } from "@/lib/pricing";
import { notify } from "@/lib/notify";

const schema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+0-9\s().-]{6,20}$/),
  address: z.string().trim().min(4).max(500),
  city: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["ussd", "delivery"]),
  operator: z.enum(["TMoney", "Flooz"]).optional(),
  location: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), accuracy: z.number().optional() }).nullable().optional(),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(30) })).min(1).max(40),
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  if (tooMany("order:" + (req.headers.get("x-forwarded-for") || "ip"), 20)) return json({ error: "Trop de commandes. Réessayez plus tard." }, 429);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Informations de commande invalides." }, 400);
  const data = parsed.data;
  if (data.paymentMethod === "ussd" && !data.operator) return json({ error: "Choisissez votre opérateur mobile money." }, 400);
  try {
    const [db, settings, user] = await Promise.all([getDb(), getSettings(), getCurrentUser()]);
    if (data.paymentMethod === "ussd" && !settings.allowUssd) return json({ error: "Le paiement mobile est momentanément indisponible." }, 400);
    if (data.paymentMethod === "delivery" && !settings.allowCod) return json({ error: "Le paiement à la livraison est momentanément indisponible." }, 400);

    // fusion des doublons puis lecture des produits en base : les prix du navigateur ne sont jamais utilisés
    const qty = new Map<string, number>();
    for (const it of data.items) qty.set(it.productId, Math.min(30, (qty.get(it.productId) || 0) + it.quantity));
    const ids = [...qty.keys()].map(oid);
    if (ids.some((x) => !x)) return json({ error: "Produit invalide." }, 400);
    const products = await db.collection("products").find({ _id: { $in: ids as NonNullable<(typeof ids)[number]>[] }, available: true }).toArray();
    if (products.length !== qty.size) return json({ error: "Un produit n'est plus disponible. Actualisez votre panier." }, 400);

    const items = products.map((p) => ({
      productId: p._id.toString(), name: p.name as string, section: p.section as "restaurant" | "huile",
      quantity: qty.get(p._id.toString()) as number, unitPrice: effectivePrice({ price: Number(p.price), promoPrice: p.promoPrice }),
    }));
    for (const p of products) {
      const q = qty.get(p._id.toString()) as number;
      if (typeof p.stock === "number" && p.stock < q) return json({ error: `Stock insuffisant pour « ${p.name} ».` }, 400);
    }
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const deliveryFee = settings.freeDeliveryFrom > 0 && subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee;
    const sections = new Set(items.map((i) => i.section));
    const section = sections.size > 1 ? "mixte" : [...sections][0];

    // décrément de stock conditionnel (avec annulation si l'un des produits échoue)
    const done: { id: unknown; q: number }[] = [];
    for (const p of products) {
      if (typeof p.stock !== "number") continue;
      const q = qty.get(p._id.toString()) as number;
      const r = await db.collection("products").updateOne({ _id: p._id, stock: { $gte: q } }, { $inc: { stock: -q } });
      if (!r.modifiedCount) {
        for (const d of done) await db.collection("products").updateOne({ _id: d.id as never }, { $inc: { stock: d.q } });
        return json({ error: `Stock insuffisant pour « ${p.name} ».` }, 400);
      }
      done.push({ id: p._id, q });
    }

    const order = {
      reference: "BG-" + randomBytes(4).toString("hex").toUpperCase(), accessToken: randomBytes(16).toString("hex"),
      userId: user?.id || null, customerName: data.customerName, phone: data.phone, address: data.address,
      city: data.city || "", notes: data.notes || "", section, items, subtotal, deliveryFee, total: subtotal + deliveryFee,
      paymentMethod: data.paymentMethod, operator: data.paymentMethod === "ussd" ? data.operator : null,
      location: data.location || null, status: "pending", paymentStatus: data.paymentMethod === "ussd" ? "pending" : "cod",
      deliveryStatus: "to_prepare", history: [], createdAt: new Date().toISOString(),
    };
    const res = await db.collection("orders").insertOne(order);
    const id = res.insertedId.toString();
    await notify({ audience: "admin", title: "Nouvelle commande", message: `Commande ${order.reference} – ${order.customerName}`, orderId: id, type: "order" });
    if (user) await notify({ audience: "user", userId: user.id, title: "Commande reçue", message: `Votre commande ${order.reference} a bien été enregistrée.`, orderId: id, type: "order" });
    return json({ id, reference: order.reference, token: order.accessToken });
  } catch {
    return json({ error: "Impossible d'enregistrer la commande." }, 500);
  }
}
