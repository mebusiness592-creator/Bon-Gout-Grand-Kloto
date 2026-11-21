import Link from "next/link";
import type { Metadata } from "next";
import { getMedia, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
export const metadata: Metadata = { title: "Production locale" };

export default async function Production() {
  const [media, products] = await Promise.all([getMedia("production-locale", 12), getProducts({ section: "huile", onlyAvailable: true, limit: 4 })]);
  return (
    <>
      <section className="hero" style={{ background: "linear-gradient(120deg,#14361c,#2f6b3a 60%,#8a5a12)" }}>
        <div className="container in"><span className="tag">Production locale</span><h1>Huile de palme & produits du terroir</h1>
          <p>Huile rouge de palme, huile de noix de palme et produits dérivés, proposés dans une boutique dédiée au sein de la même plateforme.</p>
          <div className="cta"><Link href="/produits" className="btn btn-gold">Découvrir nos produits</Link></div></div>
      </section>
      <section className="section container split">
        <div><span className="eyebrow" style={{ color: "var(--leaf)" }}>Notre activité</span><h2>Des produits locaux, de la production à votre table</h2>
          <p className="muted">Nous commercialisons l&apos;huile rouge de palme et l&apos;huile de noix de palme en plusieurs conditionnements, ainsi que d&apos;autres produits agricoles et transformés qui seront ajoutés au fil du temps.</p></div>
        <div className="panel"><h3>Au catalogue</h3><ul><li>Huile rouge de palme</li><li>Huile de noix de palme</li><li>Différents conditionnements</li><li>Produits dérivés et autres produits locaux</li></ul></div>
      </section>
      {media.length > 0 && <section className="container"><div className="media-grid">{media.map((m) => m.kind === "video" ? <video key={m._id} src={m.url} controls preload="metadata" /> : <img key={m._id} src={m.url} alt={m.title || "Production locale"} loading="lazy" />)}</div></section>}
      {products.length > 0 && <section className="section container"><h2>Produits disponibles</h2><div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div></section>}
    </>
  );
}
