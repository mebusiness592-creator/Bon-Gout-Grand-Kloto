import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
export const metadata: Metadata = { title: "Nos produits locaux" };

export default async function Produits({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const { c, q } = await searchParams;
  const [cats, products] = await Promise.all([getCategories("huile"), getProducts({ section: "huile", categoryId: c, q })]);
  return (
    <div className="container section">
      <span className="eyebrow" style={{ color: "var(--leaf)" }}>Production locale</span><h1>Nos produits</h1>
      <form action="/produits" style={{ display: "flex", gap: ".5rem", maxWidth: 520 }}>
        {c && <input type="hidden" name="c" value={c} />}
        <input name="q" defaultValue={q || ""} placeholder="Rechercher un produit…" aria-label="Rechercher" />
        <button className="btn btn-leaf">Chercher</button>
      </form>
      {cats.length > 0 && <div className="chips"><Link href="/produits" className={`chip ${!c ? "on" : ""}`}>Tout</Link>{cats.map((x) => <Link key={x._id} href={`/produits?c=${x._id}`} className={`chip ${c === x._id ? "on" : ""}`}>{x.name}</Link>)}</div>}
      <div style={{ height: 16 }} />
      {products.length ? <div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div> : <p className="muted">Aucun produit pour le moment.</p>}
    </div>
  );
}
