import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { CategoryTiles } from "@/components/CategoryTiles";
export const metadata: Metadata = { title: "Boutique des produits locaux" };

export default async function Produits({ searchParams }: { searchParams: Promise<{ c?: string; q?: string; all?: string }> }) {
  const { c, q, all } = await searchParams;
  if (c) redirect(`/produits/categorie/${c}`);
  const [cats, products] = await Promise.all([getCategories("huile"), getProducts({ section: "huile", q })]);
  const flat = Boolean(q || all) || cats.length === 0;
  const others = products.filter((p) => !p.categoryId || !cats.some((x) => x._id === p.categoryId));
  return (
    <div className="container section">
      <span className="eyebrow" style={{ color: "var(--leaf)" }}>Production locale</span><h1>{flat ? "Nos produits locaux" : "Nos catégories"}</h1>
      <form action="/produits" style={{ display: "flex", gap: ".5rem", maxWidth: 520, marginBottom: "1.2rem" }}>
        <input name="q" defaultValue={q || ""} placeholder="Rechercher un produit…" aria-label="Rechercher" />
        <button className="btn btn-leaf">Chercher</button>
      </form>
      {flat ? (products.length ? <><div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          {(q || all) && <p style={{ marginTop: "1rem" }}><Link href="/produits">← Retour aux catégories</Link></p>}</>
        : <p className="muted">Aucun produit pour le moment.</p>)
        : <>
          <CategoryTiles cats={cats} base="/produits/categorie/" leaf />
          <p style={{ marginTop: "1rem" }}><Link href="/produits?all=1" className="chip">Voir tous les produits</Link></p>
          {others.length > 0 && <section style={{ marginTop: "2rem" }}><h2>Autres produits</h2><div className="grid">{others.map((p) => <ProductCard key={p._id} p={p} />)}</div></section>}
        </>}
    </div>
  );
}
