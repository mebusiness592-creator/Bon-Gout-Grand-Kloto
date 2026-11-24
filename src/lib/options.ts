import type { OptionGroup, OptionItem, Product } from "./types";

/** Groupes d'accompagnements d'un produit. Les anciennes « variantes » sont lues comme un groupe obligatoire à choix unique. */
export function groupsOf(p: Pick<Product, "optionGroups" | "variants">): OptionGroup[] {
  if (p.optionGroups?.length) return p.optionGroups;
  if (p.variants?.length) {
    return [{ id: "legacy", label: "Votre choix", required: true, multiple: false, items: p.variants.map((v) => ({ id: v.id, label: v.label, image: v.image, description: v.description, priceMin: null, priceMax: null })) }];
  }
  return [];
}
export type ItemKind = "none" | "fixed" | "range";
export function itemKind(i: Pick<OptionItem, "priceMin" | "priceMax">): ItemKind {
  if (typeof i.priceMin !== "number") return "none";
  if (typeof i.priceMax === "number" && i.priceMax > i.priceMin) return "range";
  return "fixed";
}
