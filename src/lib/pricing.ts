type P = { price: number; promoPrice?: number | null; priceMax?: number | null };
const hasRange = (p: P) => typeof p.priceMax === "number" && p.priceMax > p.price;
export function effectivePrice(p: P): number {
  if (hasRange(p)) return p.price;
  return p.promoPrice && p.promoPrice > 0 && p.promoPrice < p.price ? p.promoPrice : p.price;
}
export function isPromo(p: P): boolean { return !hasRange(p) && effectivePrice(p) < p.price; }
export function isRange(p: P): boolean { return hasRange(p); }
const num = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)).replace(/[\u202f\u00a0]/g, " ");
export const fcfa = (n: number) => num(n) + " FCFA";
/** « 500 – 5 000 FCFA » pour une fourchette, « 1 500 FCFA » sinon. */
export function priceLabel(p: P): string { return hasRange(p) ? `${num(p.price)} – ${fcfa(p.priceMax as number)}` : fcfa(effectivePrice(p)); }
export function productImage(p: { images?: string[]; imageUrl?: string; image?: string }): string | undefined {
  return p.images?.[0] || p.imageUrl || p.image || undefined;
}
export function fdate(iso?: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lome" }).format(new Date(iso));
}
