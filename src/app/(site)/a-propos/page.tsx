import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
export const metadata: Metadata = { title: "À propos" };
export default async function About() {
  const s = await getSettings();
  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <span className="eyebrow">À propos</span><h1>{s.name}</h1>
      <p>{s.name} réunit deux activités complémentaires : un restaurant proposant cuisine africaine, européenne et fast-food, et une production locale d&apos;huile de palme et de produits du terroir.</p>
      <p>Notre engagement : des produits de qualité, une préparation soignée, la valorisation des produits locaux et un service de commande simple, pour que chacun puisse se régaler où qu&apos;il soit.</p>
      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}><Link className="btn btn-primary" href="/menu">Voir le menu</Link><Link className="btn btn-leaf" href="/produits">Nos produits</Link></div>
    </div>
  );
}
