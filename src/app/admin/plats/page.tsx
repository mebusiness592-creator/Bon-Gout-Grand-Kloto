import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { ResourceManager, type Field } from "@/components/ResourceManager";
export const metadata = { title: "Gestion du restaurant" };

export default async function Page() {
  await requireStaff();
  const db = await getDb();
  const [items, cats] = await Promise.all([
    db.collection("products").find({ section: "restaurant" }).sort({ createdAt: -1 }).toArray(),
    db.collection("categories").find({ section: "restaurant" }).sort({ order: 1 }).toArray(),
  ]);
  const categories = plain<{ _id: string; name: string }[]>(cats);
  const fields: Field[] = [
    { name: "name", label: "Nom du plat", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "priceText", label: "Prix (FCFA)", type: "text", required: true, help: "Un prix fixe (ex. 1500) ou une fourchette avec un tiret (ex. 500-5000) : le client choisira son montant dans l'intervalle." },
    { name: "promoPrice", label: "Prix promotionnel (FCFA)", type: "number", help: "Laisser vide s'il n'y a pas de promotion." },
    { name: "categoryId", label: "Catégorie", type: "select", options: categories.map((c) => ({ value: c._id, label: c.name })) },
    { name: "images", label: "Galerie de photos du plat", type: "images" },
    { name: "variants", label: "Associations / options à choisir par le client (avec photo)", type: "variants", help: "Ex. : Foufou + sauce d'arachide, Foufou + sauce tomate. Le client choisit avant de commander." },
    { name: "available", label: "Disponible à la commande", type: "bool" },
    { name: "featured", label: "Mettre en avant (plat populaire)", type: "bool" },
  ];
  return <ResourceManager resource="plats" title="Gestion du restaurant" noun="plat" items={plain(items)} fields={fields}
    cols={[{ key: "images", label: "Photo", type: "image" }, { key: "name", label: "Plat" }, { key: "categoryId", label: "Catégorie", type: "map" }, { key: "price", label: "Prix", type: "money" }, { key: "available", label: "Dispo", type: "bool" }]}
    maps={{ categoryId: Object.fromEntries(categories.map((c) => [c._id, c.name])) }} />;
}
