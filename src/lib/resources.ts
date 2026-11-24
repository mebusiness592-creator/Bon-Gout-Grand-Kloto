import { z } from "zod";
import { Db } from "mongodb";
import { oid } from "./db";
import { PLACEMENTS } from "./labels";

const url = z.string().url().max(600).refine((u) => u.startsWith("https://"), "URL https requise.");
const productBase = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  priceText: z.string().trim().min(1).max(40),
  promoPrice: z.number().int().min(0).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  images: z.array(url).max(8).optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  format: z.string().trim().max(80).optional(),
  stock: z.number().int().min(0).nullable().optional(),
  variants: z.array(z.object({ id: z.string().min(1).max(40), label: z.string().trim().min(1).max(60), image: z.union([z.literal(""), url]).optional(), description: z.string().trim().max(600).optional() })).max(12).optional(),
  videos: z.array(url).max(4).optional(),
  optionGroups: z.array(z.object({
    id: z.string().min(1).max(40), label: z.string().trim().min(1).max(60), required: z.boolean().optional(), multiple: z.boolean().optional(),
    items: z.array(z.object({
      id: z.string().min(1).max(40), label: z.string().trim().min(1).max(80), image: z.union([z.literal(""), url]).optional(), description: z.string().trim().max(600).optional(),
      priceMin: z.number().int().min(0).max(100_000_000).nullable().optional(), priceMax: z.number().int().min(0).max(100_000_000).nullable().optional(),
    })).min(1).max(30),
  })).max(10).optional(),
  mealTime: z.enum(["matin", "midi", "soir"]).nullable().optional(),
});
const categoryBase = z.object({ name: z.string().trim().min(2).max(80), section: z.enum(["restaurant", "huile"]), order: z.number().int().min(0).max(9999).optional(), image: z.union([z.literal(""), url]).optional() });
const mediaBase = z.object({
  url, kind: z.enum(["image", "video"]), title: z.string().trim().max(120).optional(),
  placement: z.string().refine((p) => p in PLACEMENTS, "Emplacement invalide."),
});

type Def = { collection: string; section?: "restaurant" | "huile"; base: z.AnyZodObject };
export const RESOURCES: Record<string, Def> = {
  plats: { collection: "products", section: "restaurant", base: productBase },
  produits: { collection: "products", section: "huile", base: productBase },
  categories: { collection: "categories", base: categoryBase },
  media: { collection: "media", base: mediaBase },
};

/** Prix libre : « 1500 » ou fourchette « 500-5000 » (tiret, « à »). */
export function parsePrice(text: string): { min: number; max: number | null } | null {
  const cleaned = text.replace(/fcfa|cfa|f\b/gi, "");
  const parts = cleaned.split(/[-–—]|\sà\s/i).map((x) => x.replace(/\D/g, "")).filter(Boolean);
  if (parts.length < 1 || parts.length > 2) return null;
  const min = Number(parts[0]);
  const max = parts.length === 2 ? Number(parts[1]) : null;
  if (!Number.isFinite(min) || min > 100_000_000) return null;
  if (max !== null && (max <= min || max > 100_000_000)) return null;
  return { min, max };
}

/** Valide le corps et prépare le document (types cohérents : categoryId toujours ObjectId). */
export async function prepare(name: string, body: unknown, mode: "create" | "update", db: Db): Promise<{ def: Def; doc: Record<string, unknown> } | { error: string }> {
  const def = RESOURCES[name];
  if (!def) return { error: "Ressource inconnue." };
  const schema = mode === "create" ? def.base : def.base.partial();
  const p = schema.safeParse(body);
  if (!p.success) return { error: p.error.issues[0]?.message ? `${p.error.issues[0].path.join(".")} : ${p.error.issues[0].message}` : "Données invalides." };
  const doc: Record<string, unknown> = { ...p.data };
  if (def.collection === "products") {
    if (def.section && mode === "create") doc.section = def.section;
    if ("priceText" in doc) {
      const pr = parsePrice(String(doc.priceText));
      if (!pr) return { error: "Prix invalide : écrivez un prix (1500) ou une fourchette (500-5000)." };
      doc.price = pr.min; doc.priceMax = pr.max; delete doc.priceText;
      if (pr.max) doc.promoPrice = null;
    }
    if (Array.isArray(doc.variants)) doc.variants = (doc.variants as { id: string; label: string; image?: string; description?: string }[]).map((v) => ({ id: v.id, label: v.label, image: v.image || "", description: v.description || "" }));
    if (Array.isArray(doc.optionGroups)) {
      const groups = doc.optionGroups as { id: string; label: string; required?: boolean; multiple?: boolean; items: { id: string; label: string; image?: string; description?: string; priceMin?: number | null; priceMax?: number | null }[] }[];
      for (const g of groups) for (const it of g.items) {
        let min = typeof it.priceMin === "number" ? it.priceMin : null;
        let max = typeof it.priceMax === "number" ? it.priceMax : null;
        if (min === null && max !== null) { min = max; }
        if (min !== null && max === null) max = min;
        if (min !== null && max !== null && max < min) return { error: `« ${it.label} » : le prix maximum doit être supérieur ou égal au prix minimum.` };
        it.priceMin = min; it.priceMax = max; it.image = it.image || ""; it.description = it.description || "";
      }
      doc.optionGroups = groups.map((g) => ({ id: g.id, label: g.label, required: Boolean(g.required), multiple: Boolean(g.multiple), items: g.items }));
      doc.variants = []; // l'ancien système de variantes est remplacé par les groupes d'accompagnements
    }
    if ("categoryId" in doc) {
      if (doc.categoryId) {
        const id = oid(doc.categoryId);
        const cat = id ? await db.collection("categories").findOne({ _id: id, section: def.section }) : null;
        if (!cat) return { error: "Catégorie invalide." };
        doc.categoryId = id;
      } else doc.categoryId = null;
    }
    if (typeof doc.promoPrice === "number" && typeof doc.price === "number" && doc.promoPrice >= doc.price) doc.promoPrice = null;
    if (mode === "create") { doc.available = doc.available ?? true; doc.images = doc.images ?? []; doc.videos = doc.videos ?? []; doc.createdAt = new Date().toISOString(); }
  }
  if (def.collection === "categories" && mode === "create") doc.order = doc.order ?? 0;
  if (def.collection === "media" && mode === "create") doc.createdAt = new Date().toISOString();
  return { def, doc };
}
