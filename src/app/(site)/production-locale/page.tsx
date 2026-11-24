import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getMedia, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Slides } from "@/components/Slides";
export const metadata: Metadata = { title: "Produits locaux" };

export default async function Production() {
  const [media, products, cats] = await Promise.all([getMedia("production-locale", 12), getProducts({ section: "huile", onlyAvailable: true, limit: 4 }), getCategories("huile")]);
  const imgs = media.map((m) => m.url);
  return (
    <>
      <section className="hero" style={{ background: "linear-gradient(120deg,#14361c,#2f6b3a 60%,#8a5a12)" }}>
        <Slides images={imgs} />
        {imgs.length > 0 && <div className="shade" />}
        <div className="container in"><span className="tag">Production locale</span><h1>Produits locaux du Grand Kloto</h1>
          <p>Une boutique dédiée à nos produits locaux, au sein de la même plateforme que le restaurant.</p>
          <div className="cta"><Link href="/produits" className="btn btn-gold">Découvrir nos produits</Link></div></div>
      </section>
      <section className="section container split">
        <div><span className="eyebrow" style={{ color: "var(--leaf)" }}>Notre activité</span><h2>Des produits du terroir, à portée de commande</h2>
          <p className="muted">Nous proposons une sélection de produits locaux, agricoles et transformés. Le catalogue s&apos;enrichit régulièrement : retrouvez toutes les catégories et conditionnements disponibles dans la boutique.</p></div>
        {cats.length > 0 ? <CategoryTiles cats={cats.slice(0, 4)} base="/produits/categorie/" leaf /> : <div className="panel muted">Les catégories de produits seront bientôt disponibles.</div>}
      </section>
      {products.length > 0 && <section className="section container"><h2>Produits disponibles</h2><div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div></section>}
    </>
  );
}
