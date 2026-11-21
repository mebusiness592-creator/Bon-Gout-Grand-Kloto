import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getProduct } from "@/lib/catalog";
import { ProductOrder } from "@/components/ProductOrder";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProduct((await params).id);
  return { title: p?.name || "Détail" };
}
export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProduct((await params).id);
  if (!p) notFound();
  const cat = p.categoryId ? await getCategory(p.categoryId) : null;
  const root = p.section === "restaurant" ? "/menu" : "/produits";
  const back = cat ? `${root}/${p.section === "restaurant" ? "specialite" : "categorie"}/${cat._id}` : root;
  return (
    <div className="container section">
      <Link href={back} className="muted">← {cat ? cat.name : p.section === "restaurant" ? "Menu" : "Boutique"}</Link>
      <div style={{ marginTop: "1rem" }}><ProductOrder p={p} /></div>
    </div>
  );
}
