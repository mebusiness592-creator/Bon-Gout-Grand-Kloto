import { getDb, oid, plain } from "./db";
import type { Category, MediaItem, Product, Section } from "./types";

export async function getCategories(section?: Section): Promise<Category[]> {
  try {
    const q = section ? { section } : {};
    return plain(await (await getDb()).collection("categories").find(q).sort({ order: 1, name: 1 }).toArray());
  } catch { return []; }
}
export async function getProducts(o: { section?: Section; categoryId?: string; q?: string; limit?: number; featured?: boolean; onlyAvailable?: boolean }): Promise<Product[]> {
  try {
    const f: Record<string, unknown> = {};
    if (o.section) f.section = o.section;
    if (o.featured) f.featured = true;
    if (o.onlyAvailable) f.available = true;
    const cid = o.categoryId ? oid(o.categoryId) : null;
    if (cid) f.categoryId = cid;
    if (o.q) {
      const rx = new RegExp(o.q.trim().slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      f.$or = [{ name: rx }, { description: rx }];
    }
    let cur = (await getDb()).collection("products").find(f).sort({ available: -1, createdAt: -1 });
    if (o.limit) cur = cur.limit(o.limit);
    return plain(await cur.toArray());
  } catch { return []; }
}
export async function getProduct(id: string): Promise<Product | null> {
  const _id = oid(id);
  if (!_id) return null;
  try { const d = await (await getDb()).collection("products").findOne({ _id }); return d ? plain(d) : null; } catch { return null; }
}
export async function getMedia(placement?: string, limit = 12): Promise<MediaItem[]> {
  try {
    const f = placement ? { placement } : {};
    return plain(await (await getDb()).collection("media").find(f).sort({ createdAt: -1 }).limit(limit).toArray());
  } catch { return []; }
}
