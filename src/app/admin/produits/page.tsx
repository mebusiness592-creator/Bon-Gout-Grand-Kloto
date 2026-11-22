import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { ResourceManager, type Field } from "@/components/ResourceManager";
export const metadata = { title: "Production locale" };

export default async function Page() {
  await requireStaff();
  const db = await getDb();
  const [items, cats] = await Promise.all([
    db.collection("products").find({ section: "huile" }).sort({ createdAt: -1 }).toArray(),
    db.collection("categories").find({ section: "huile" }).sort({ order: 1 }).toArray(),
  ]);
  const categories = plain<{ _id: string; name: string }[]>(cats);
  const fields: Field[] = [
    { name: "name", label: "Nom du produit", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "format", label: "Conditionnement / format", type: "text", help: "Ex. : bouteille 1 L, bidon 5 L…" },
    { name: "priceText", label: "Prix (FCFA)", type: "text", required: true, help: "Un prix fixe (ex. 1500) ou une fourchette avec un tiret (ex. 500-5000) : le client choisira son montant dans l'intervalle." },
    { name: "promoPrice", label: "Prix promotionnel (FCFA)", type: "number" },
    { name: "stock", label: "Stock", type: "number", help: "Laisser vide = stock non suivi." },
    { name: "categoryId", label: "Catégorie", type: "select", options: categories.map((c) => ({ value: c._id, label: c.name })) },
    { name: "images", label: "Galerie de photos", type: "images" },
    { name: "videos", label: "Vidéos (facultatif)", type: "videos", help: "MP4, WebM ou MOV — 80 Mo maximum par vidéo." },
    { name: "variants", label: "Variantes à choisir par le client (avec photo)", type: "variants", help: "Ex. : différents conditionnements ou variétés." },
    { name: "available", label: "Disponible à la vente", type: "bool" },
  ];
  return <ResourceManager resource="produits" title="Production locale" noun="produit" items={plain(items)} fields={fields}
    cols={[{ key: "images", label: "Photo", type: "image" }, { key: "name", label: "Produit" }, { key: "format", label: "Format" }, { key: "price", label: "Prix", type: "money" }, { key: "stock", label: "Stock" }, { key: "available", label: "Dispo", type: "bool" }]} />;
}
