export function effectivePrice(p: { price: number; promoPrice?: number | null }): number {
  return p.promoPrice && p.promoPrice > 0 && p.promoPrice < p.price ? p.promoPrice : p.price;
}
export function isPromo(p: { price: number; promoPrice?: number | null }): boolean {
  return effectivePrice(p) < p.price;
}
export const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)).replace(/\u202f/g, " ") + " FCFA";
export function productImage(p: { images?: string[]; imageUrl?: string }): string | undefined {
  return p.images?.[0] || p.imageUrl || undefined;
}
export function fdate(iso?: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lome" }).format(new Date(iso));
}
