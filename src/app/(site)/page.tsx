import Link from "next/link";
import { getCategories, getMedia, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ProductCard";
import { ShieldCheck, ChefHat, Leaf, Truck, Phone, MapPin, Clock } from "lucide-react";

export default async function Home() {
  const [s, cats, featured, local, heroMedia, localMedia] = await Promise.all([
    getSettings(), getCategories("restaurant"),
    getProducts({ section: "restaurant", onlyAvailable: true, limit: 8 }),
    getProducts({ section: "huile", onlyAvailable: true, limit: 4 }),
    getMedia("accueil-restaurant", 1), getMedia("production-locale", 1),
  ]);
  const hero = heroMedia.find((m) => m.kind === "image");
  const lm = localMedia.find((m) => m.kind === "image");
  return (
    <>
      <section className="hero">
        {hero && <img className="bg" src={hero.url} alt="" />}
        <div className="container in">
          <span className="tag">🔥 Cuisine faite maison · Commande en ligne</span>
          <h1>{s.name}</h1>
          <p>Bienvenue ! Cuisine africaine et européenne, fufu, riz, grillades, shawarma et burgers : savourez des plats préparés avec soin, livrés chez vous ou à emporter.</p>
          <div className="cta">
            <Link href="/menu" className="btn btn-gold">Découvrir notre menu</Link>
            <Link href="/menu" className="btn btn-primary">Commander maintenant</Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="center"><span className="eyebrow">Nos plats</span><h2>Les plats du moment</h2></div>
        {cats.length > 0 && <div className="chips" style={{ justifyContent: "center" }}>{cats.map((c) => <Link key={c._id} className="chip" href={`/menu?c=${c._id}`}>{c.name}</Link>)}</div>}
        {featured.length ? <div className="grid">{featured.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          : <p className="center muted">Le menu sera bientôt disponible.</p>}
        <p className="center" style={{ marginTop: "1.5rem" }}><Link href="/menu" className="btn btn-ghost" style={{ color: "var(--brown)" }}>Voir tout le menu</Link></p>
      </section>

      <section className="section leafband">
        <div className="container split">
          <div>
            <span className="eyebrow" style={{ color: "var(--gold)" }}>Production locale</span>
            <h2>Huile rouge de palme du Grand Kloto</h2>
            <p className="muted">Huile rouge de palme, huile de noix de palme et produits locaux : une boutique à part entière pour retrouver le goût authentique de chez nous.</p>
            <Link href="/produits" className="btn btn-gold" style={{ marginTop: ".8rem" }}>Découvrir nos produits</Link>
          </div>
          {lm ? <img src={lm.url} alt="Production locale" style={{ borderRadius: 18, aspectRatio: "4/3", objectFit: "cover", width: "100%" }} />
            : <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>{local.slice(0, 2).map((p) => <ProductCard key={p._id} p={p} />)}</div>}
        </div>
        {lm && local.length > 0 && <div className="container grid" style={{ marginTop: "1.5rem" }}>{local.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
      </section>

      <section className="section container">
        <div className="center"><span className="eyebrow">Pourquoi nous choisir</span><h2>Le goût, la qualité, le service</h2></div>
        <div className="feat">
          <div className="panel"><div className="ic"><ShieldCheck /></div><h3>Qualité des produits</h3><p className="muted">Des ingrédients choisis avec exigence.</p></div>
          <div className="panel"><div className="ic"><ChefHat /></div><h3>Préparation soignée</h3><p className="muted">Chaque plat est préparé avec attention.</p></div>
          <div className="panel"><div className="ic"><Leaf /></div><h3>Produits locaux</h3><p className="muted">Huile de palme et produits du terroir.</p></div>
          <div className="panel"><div className="ic"><Truck /></div><h3>Commande & livraison</h3><p className="muted">{s.deliveryNote}</p></div>
        </div>
      </section>

      <section className="section container">
        <div className="panel split">
          <div><span className="eyebrow">Contact</span><h2>Une question ? Une commande ?</h2><p className="muted">Notre équipe vous répond avec plaisir.</p></div>
          <div style={{ display: "grid", gap: ".6rem" }}>
            <span><MapPin size={16} /> {s.address}</span>
            {s.phone && <a href={`tel:${s.phone}`}><Phone size={16} /> {s.phone}</a>}
            {s.hours && <span><Clock size={16} /> {s.hours}</span>}
            <Link href="/contact" className="btn btn-primary" style={{ width: "fit-content" }}>Nous contacter</Link>
          </div>
        </div>
      </section>
    </>
  );
}
