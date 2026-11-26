import { NextRequest } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getDb, oid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin, tooMany } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import { effectivePrice } from "@/lib/pricing";
import { groupsOf, itemKind } from "@/lib/options";
import type { OrderOption } from "@/lib/types";
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
  items: z.array(z.object({
    productId: z.string().min(1),
    unitPrice: z.number().int().min(0).max(100_000_000).optional(), quantity: z.number().int().min(1).max(30),
    options: z.array(z.object({ groupId: z.string().min(1).max(40), itemId: z.string().min(1).max(40), amount: z.number().int().min(0).max(100_000_000).optional() })).max(40).optional(),
  })).min(1).max(40),
});
type Line = { productId: string; unitPrice?: number; quantity: number; options?: { groupId: string; itemId: string; amount?: number }[] };

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

    const lines = new Map<string, Line>();
    for (const it of data.items) {
      const k = `${it.productId}|${it.unitPrice ?? ""}|${(it.options || []).map((o) => `${o.groupId}.${o.itemId}.${o.amount ?? ""}`).sort().join(",")}`;
      const cur = lines.get(k);
      if (cur) cur.quantity = Math.min(30, cur.quantity + it.quantity); else lines.set(k, { ...it });
    }
    const pids = [...new Set([...lines.values()].map((l) => l.productId))];
    const ids = pids.map(oid);
    if (ids.some((x) => !x)) return json({ error: "Produit invalide." }, 400);
    const products = await db.collection("products").find({ _id: { $in: ids as NonNullable<(typeof ids)[number]>[] }, available: true }).toArray();
    if (products.length !== pids.length) return json({ error: "Un produit n'est plus disponible. Actualisez votre panier." }, 400);
    const pm = new Map(products.map((p) => [p._id.toString(), p]));

    // Les prix viennent TOUJOURS de la base. Seul un prix à fourchette accepte un montant choisi, vérifié dans l'intervalle.
    const items: Record<string, unknown>[] = [];
    const qtyByProduct = new Map<string, number>();
    for (const l of lines.values()) {
      const p = pm.get(l.productId)!;
      // Accompagnements : chaque choix est revérifié sur la base (groupes, éléments, limites de prix, obligatoire / multiple).
      const groups = groupsOf({ optionGroups: p.optionGroups, variants: p.variants });
      const picked = l.options || [];
      const chosen: OrderOption[] = [];
      let extras = 0;
      let variantAmount: number | undefined; // montant de la variante choisie : il REMPLACE le prix du plat
      for (const o of picked) {
        const g = groups.find((x) => x.id === o.groupId);
        const it = g?.items.find((x) => x.id === o.itemId);
        if (!g || !it) return json({ error: `Un accompagnement de « ${p.name} » n'est plus disponible. Actualisez votre panier.` }, 400);
        if (chosen.some((c) => c.groupId === g.id && c.itemId === it.id)) return json({ error: "Accompagnement en double." }, 400);
        const kind = itemKind(it);
        let amount: number | undefined;
        if (kind === "fixed") amount = it.priceMin as number;
        else if (kind === "range") {
          if (o.amount === undefined || o.amount < (it.priceMin as number) || o.amount > (it.priceMax as number)) return json({ error: `Montant invalide pour « ${it.label} » (entre ${it.priceMin} et ${it.priceMax} FCFA).` }, 400);
          amount = o.amount;
        }
        if (g.role === "variant" && amount !== undefined) variantAmount = amount; else extras += amount ?? 0;
        chosen.push({
          groupId: g.id, groupLabel: g.label, itemId: it.id, label: it.label, ...(g.role ? { role: g.role } : {}),
          ...(g.role === "sauce" && amount === undefined ? { free: true } : {}), description: it.description || null, image: it.image || null,
          ...(amount === undefined ? {} : { amount }),
        });
      }
      for (const g of groups) {
        const n = chosen.filter((c) => c.groupId === g.id).length;
        if (g.required && n === 0) return json({ error: `Choisissez : ${g.label} (« ${p.name} »).` }, 400);
        if (!g.multiple && n > 1) return json({ error: `Un seul choix possible pour ${g.label}.` }, 400);
      }
      const summary = chosen.map((c) => (c.amount ? `${c.label} (${c.amount} FCFA)` : c.label)).join(" · ");
      const min = Number(p.price);
      const max = typeof p.priceMax === "number" ? p.priceMax : null;
      let unit: number;
      if (variantAmount !== undefined) unit = variantAmount;
      else if (max && max > min) {
        if (l.unitPrice === undefined || l.unitPrice < min || l.unitPrice > max) return json({ error: `Montant invalide pour « ${p.name} » (entre ${min} et ${max} FCFA).` }, 400);
        unit = l.unitPrice;
      } else unit = effectivePrice({ price: min, promoPrice: p.promoPrice });
      items.push({
        productId: l.productId, options: chosen, variantLabel: summary || null, name: p.name, section: p.section,
        quantity: l.quantity, dishAmount: unit, unitPrice: unit + extras, image: p.images?.[0] || p.imageUrl || null,
      });
      qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) || 0) + l.quantity);
    }
    for (const p of products) {
      const q = qtyByProduct.get(p._id.toString()) as number;
      if (typeof p.stock === "number" && p.stock < q) return json({ error: `Stock insuffisant pour « ${p.name} ».` }, 400);
    }
    const subtotal = items.reduce((s, i) => s + (i.quantity as number) * (i.unitPrice as number), 0);
    const deliveryFee = settings.freeDeliveryFrom > 0 && subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee;
    const sections = new Set(items.map((i) => i.section as string));
    const section = sections.size > 1 ? "mixte" : [...sections][0];

    const done: { id: unknown; q: number }[] = [];
    for (const p of products) {
      if (typeof p.stock !== "number") continue;
      const q = qtyByProduct.get(p._id.toString()) as number;
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
      deliveryStatus: "to_prepare", history: [], createdAt: new Date().toISOString(), createdAtDate: new Date(),
    };
    const res = await db.collection("orders").insertOne(order);
    const id = res.insertedId.toString();
    if (settings.notifyNewOrders) await notify({ audience: "admin", title: "Nouvelle commande", message: `Commande ${order.reference} – ${order.customerName}`, orderId: id, type: "order", image: (items[0]?.image as string | null) || null });
    for (const p of products) {
      if (typeof p.stock === "number" && p.stock - (qtyByProduct.get(p._id.toString()) as number) <= 3) await notify({ audience: "admin", title: "Stock faible", message: `« ${p.name} » : il reste ${Math.max(0, p.stock - (qtyByProduct.get(p._id.toString()) as number))} en stock.`, type: "stock" });
    }
    if (user) await notify({ audience: "user", userId: user.id, title: "Commande reçue", message: `Votre commande ${order.reference} a bien été enregistrée.`, orderId: id, type: "order", image: (items[0]?.image as string | null) || null });
    return json({ id, reference: order.reference, token: order.accessToken });
  } catch {
    return json({ error: "Impossible d'enregistrer la commande." }, 500);
  }
}