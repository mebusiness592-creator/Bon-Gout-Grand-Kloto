import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCategory((await params).id);
  return { title: c ? `${c.name} – Menu` : "Spécialité" };
}
export default async function Specialite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = await getCategory(id);
  if (!cat || cat.section !== "restaurant") notFound();
  const products = await getProducts({ section: "restaurant", categoryId: id });
  return (
    <div className="container section">
      <Link href="/menu" className="muted">← Toutes les spécialités</Link>
      {cat.image && <div className="slidebox" style={{ aspectRatio: "21/8", marginTop: ".8rem" }}><img className="slide on" src={cat.image} alt={cat.name} /></div>}
      <h1 style={{ marginTop: "1rem" }}>{cat.name}</h1>
      {products.length ? <div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div> : <p className="muted">Aucun plat dans cette spécialité pour le moment.</p>}
    </div>
  );
}
