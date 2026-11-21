import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { guard, json } from "@/lib/guard";

const s = (n: number) => z.string().trim().max(n);
const schema = z.object({
  name: s(100).min(2), tagline: s(200), phone: s(30), whatsapp: s(30), email: z.union([z.literal(""), z.string().trim().email().max(120)]),
  address: s(300), hours: s(300), deliveryFee: z.number().int().min(0).max(1_000_000), freeDeliveryFrom: z.number().int().min(0).max(100_000_000),
  deliveryNote: s(300), allowCod: z.boolean(), allowUssd: z.boolean(), paymentInstructions: s(800),
  facebook: s(300), instagram: s(300), tiktok: s(300), notifyNewOrders: z.boolean(),
});
export async function PUT(req: NextRequest) {
  const g = await guard(req, ["admin"]);
  if ("error" in g) return g.error;
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return json({ error: `Paramètres invalides (${p.error.issues[0]?.path.join(".")}).` }, 400);
  await (await getDb()).collection("settings").updateOne({ _id: "main" as never }, { $set: p.data }, { upsert: true });
  return json({ ok: true });
}
