import Link from "next/link";
import { getCategories, getMedia, getProducts } from "@/lib/catalog";
import { getGuide, getSettings } from "@/lib/settings";
import { GuideButton } from "@/components/GuideButton";
import { ProductCard } from "@/components/ProductCard";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Slides } from "@/components/Slides";
import { ShieldCheck, ChefHat, Leaf, Truck, Phone, MapPin, Clock } from "lucide-react";

export default async function Home() {
  const [s, guide, cats, featured, local, localCats, heroMedia, localMedia] = await Promise.all([
    getSettings(), getGuide(), getCategories("restaurant"),
    getProducts({ section: "restaurant", onlyAvailable: true, limit: 8 }),
    getProducts({ section: "huile", onlyAvailable: true, limit: 4 }),
    getCategories("huile"),
    getMedia("accueil-restaurant", 10), getMedia("production-locale", 10),
  ]);
  const hero = heroMedia.map((m) => m.url);
  const hasGuide = Boolean(guide.video) || guide.steps.length > 0;
  const lm = localMedia.map((m) => m.url);
  return (
    <>
      <section className="hero">
        <Slides images={hero} />
        {hero.length > 0 && <div className="shade" />}
        <div className="container in">
          <span className="tag">🔥 Cuisine faite maison · Commande en ligne</span>
          <h1>{s.name}</h1>
          <p>Bienvenue ! Cuisine africaine et européenne, fufu, riz, grillades, shawarma et burgers : savourez des plats préparés avec soin, livrés chez vous ou à emporter.</p>
          <div className="cta">
            <Link href="/menu" className="btn btn-gold">Découvrir notre menu</Link>
            <Link href="/menu" className="btn btn-primary">Commander maintenant</Link>
            {hasGuide && <GuideButton guide={guide} className="btn btn-ghost" label="Comment commander ?" />}
          </div>
        </div>
      </section>

      {cats.length > 0 && <section className="section container">
        <div className="center"><span className="eyebrow">Nos spécialités</span><h2>Qu&apos;avez-vous envie de manger ?</h2></div>
        <CategoryTiles cats={cats} base="/menu/specialite/" />
      </section>}

      <section className="section container" style={{ paddingTop: cats.length ? 0 : undefined }}>
        <div className="center"><span className="eyebrow">Plats du moment</span><h2>Nos plats</h2></div>
        {featured.length ? <div className="grid">{featured.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          : <p className="center muted">Le menu sera bientôt disponible.</p>}
        <p className="center" style={{ marginTop: "1.5rem" }}><Link href="/menu" className="btn btn-ghost" style={{ color: "var(--brown)" }}>Voir tout le menu</Link></p>
      </section>

      <section className="section leafband">
        <div className="container split">
          <div>
            <span className="eyebrow" style={{ color: "var(--gold)" }}>Production locale</span>
            <h2>Produits locaux du Grand Kloto</h2>
            <p className="muted">Découvrez notre boutique de produits locaux : des produits du terroir sélectionnés et transformés ici.</p>
            <Link href="/produits" className="btn btn-gold" style={{ marginTop: ".8rem" }}>Découvrir nos produits</Link>
          </div>
          {lm.length > 0 ? <div className="slidebox"><Slides images={lm} /></div>
            : localCats.length > 0 ? <CategoryTiles cats={localCats.slice(0, 4)} base="/produits/categorie/" leaf /> : null}
        </div>
        {local.length > 0 && <div className="container grid" style={{ marginTop: "1.5rem" }}>{local.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
      </section>

      <section className="section container">
        <div className="center"><span className="eyebrow">Pourquoi nous choisir</span><h2>Le goût, la qualité, le service</h2></div>
        <div className="feat">
          <div className="panel"><div className="ic"><ShieldCheck /></div><h3>Qualité des produits</h3><p className="muted">Des ingrédients choisis avec exigence.</p></div>
          <div className="panel"><div className="ic"><ChefHat /></div><h3>Préparation soignée</h3><p className="muted">Chaque plat est préparé avec attention.</p></div>
          <div className="panel"><div className="ic"><Leaf /></div><h3>Produits locaux</h3><p className="muted">Une sélection de produits du terroir.</p></div>
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
