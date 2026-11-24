import Link from "next/link";
import type { Metadata } from "next";
import { getMedia } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { Slides } from "@/components/Slides";
export const metadata: Metadata = { title: "Le restaurant" };

export default async function Restaurant() {
  const [s, media, banners] = await Promise.all([getSettings(), getMedia("restaurant", 12), getMedia("accueil-restaurant", 10)]);
  const hero = banners.map((m) => m.url);
  const specs = ["Cuisine africaine", "Cuisine européenne", "Fast-food", "Fufu et pâte", "Riz et préparations", "Poulet, poisson et viande", "Grillades et barbecue", "Shawarma", "Burgers"];
  return (
    <>
      <section className="hero"><Slides images={hero} />{hero.length > 0 && <div className="shade" />}<div className="container in"><span className="tag">Restaurant</span><h1>Restaurant Bon Goût</h1><p>Une table généreuse où la cuisine africaine rencontre les saveurs européennes et le fast-food, avec des spécialités selon les jours.</p>
        <div className="cta"><Link href="/menu" className="btn btn-gold">Voir le menu</Link><Link href="/menu" className="btn btn-primary">Commander</Link></div></div></section>
      <section className="section container split">
        <div><span className="eyebrow">Nos spécialités</span><h2>Ce que vous allez adorer</h2><div className="chips">{specs.map((x) => <span key={x} className="chip">{x}</span>)}</div>
          <p className="muted">D&apos;autres spécialités sont proposées selon les jours : consultez le menu pour voir les plats disponibles.</p></div>
        <div className="panel"><h3>Informations pratiques</h3><p><strong>Adresse :</strong> {s.address}</p>{s.phone && <p><strong>Téléphone :</strong> <a href={`tel:${s.phone}`}>{s.phone}</a></p>}
          <p><strong>Horaires :</strong> {s.hours || "à renseigner prochainement"}</p><Link href="/contact" className="btn btn-ghost" style={{ color: "var(--brown)" }}>Nous contacter</Link></div>
      </section>
      {media.length > 0 && <section className="section container"><h2>L&apos;établissement en images</h2>
        <div className="media-grid">{media.map((m) => m.kind === "video" ? <video key={m._id} src={m.url} controls preload="metadata" /> : <img key={m._id} src={m.url} alt={m.title || "Restaurant Bon Goût"} loading="lazy" />)}</div></section>}
    </>
  );
}
