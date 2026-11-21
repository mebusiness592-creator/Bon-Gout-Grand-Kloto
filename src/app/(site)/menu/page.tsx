import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { CategoryTiles } from "@/components/CategoryTiles";
export const metadata: Metadata = { title: "Menu – Nos spécialités" };

export default async function Menu({ searchParams }: { searchParams: Promise<{ c?: string; q?: string; all?: string }> }) {
  const { c, q, all } = await searchParams;
  if (c) redirect(`/menu/specialite/${c}`);
  const [cats, products] = await Promise.all([getCategories("restaurant"), getProducts({ section: "restaurant", q })]);
  const flat = Boolean(q || all) || cats.length === 0;
  const others = products.filter((p) => !p.categoryId || !cats.some((x) => x._id === p.categoryId));
  return (
    <div className="container section">
      <span className="eyebrow">Restaurant</span><h1>{flat ? "Nos plats" : "Nos spécialités"}</h1>
      <form action="/menu" style={{ display: "flex", gap: ".5rem", maxWidth: 520, marginBottom: "1.2rem" }}>
        <input name="q" defaultValue={q || ""} placeholder="Rechercher un plat…" aria-label="Rechercher" />
        <button className="btn btn-primary">Chercher</button>
      </form>
      {flat ? (products.length ? <><div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          {(q || all) && <p style={{ marginTop: "1rem" }}><Link href="/menu">← Retour aux spécialités</Link></p>}</>
        : <p className="muted">Aucun plat ne correspond à votre recherche.</p>)
        : <>
          <CategoryTiles cats={cats} base="/menu/specialite/" />
          <p style={{ marginTop: "1rem" }}><Link href="/menu?all=1" className="chip">Voir tous les plats</Link></p>
          {others.length > 0 && <section style={{ marginTop: "2rem" }}><h2>Autres plats</h2><div className="grid">{others.map((p) => <ProductCard key={p._id} p={p} />)}</div></section>}
        </>}
    </div>
  );
}
