import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
export const metadata: Metadata = { title: "Menu – Nos plats" };

export default async function Menu({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const { c, q } = await searchParams;
  const [cats, products] = await Promise.all([getCategories("restaurant"), getProducts({ section: "restaurant", categoryId: c, q })]);
  const filtered = Boolean(c || q);
  const groups = cats.map((cat) => ({ name: cat.name, items: products.filter((p) => p.categoryId === cat._id) })).filter((g) => g.items.length);
  const others = products.filter((p) => !p.categoryId || !cats.some((x) => x._id === p.categoryId));
  return (
    <div className="container section">
      <span className="eyebrow">Restaurant</span><h1>Nos plats</h1>
      <form action="/menu" style={{ display: "flex", gap: ".5rem", maxWidth: 520 }}>
        {c && <input type="hidden" name="c" value={c} />}
        <input name="q" defaultValue={q || ""} placeholder="Rechercher un plat…" aria-label="Rechercher" />
        <button className="btn btn-primary">Chercher</button>
      </form>
      <div className="chips"><Link href="/menu" className={`chip ${!c ? "on" : ""}`}>Tout</Link>
        {cats.map((x) => <Link key={x._id} href={`/menu?c=${x._id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`chip ${c === x._id ? "on" : ""}`}>{x.name}</Link>)}</div>
      {products.length === 0 ? <p className="muted">Aucun plat ne correspond à votre recherche.</p>
        : filtered ? <div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        : <>
          {groups.map((g) => <section key={g.name} style={{ marginBottom: "2rem" }}><h2>{g.name}</h2><div className="grid">{g.items.map((p) => <ProductCard key={p._id} p={p} />)}</div></section>)}
          {others.length > 0 && <section><h2>{groups.length ? "Autres plats" : "Nos plats"}</h2><div className="grid">{others.map((p) => <ProductCard key={p._id} p={p} />)}</div></section>}
        </>}
    </div>
  );
}
