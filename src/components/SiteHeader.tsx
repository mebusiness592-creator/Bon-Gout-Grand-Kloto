"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBasket, User, Utensils } from "lucide-react";
import { useCart } from "./CartProvider";

const links = [
  ["/", "Accueil"], ["/restaurant", "Restaurant"], ["/menu", "Menu"], ["/production-locale", "Production locale"],
  ["/produits", "Nos produits"], ["/a-propos", "À propos"], ["/contact", "Contact"],
];
export function SiteHeader({ name, user }: { name: string; user: { name: string; role: string } | null }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { count } = useCart();
  useEffect(() => setOpen(false), [path]);
  const acct = user ? (user.role === "customer" ? "/mon-compte" : "/admin") : "/connexion";
  return (
    <header className="topbar">
      <div className="container in">
        <Link href="/" className="brand"><span className="logo"><Utensils size={20} /></span><span>{name.replace("DU GRAND KLOTO", "").trim()}<br /><small style={{ fontWeight: 600, color: "var(--flame)" }}>DU GRAND KLOTO</small></span></Link>
        <nav className="nav" aria-label="Navigation principale">
          {links.map(([h, l]) => <Link key={h} href={h} className={path === h ? "on" : ""}>{l}</Link>)}
        </nav>
        <div className="tools">
          <Link href={acct} className="iconbtn" aria-label="Mon compte" title={user ? user.name : "Se connecter"}><User size={20} /></Link>
          <Link href="/panier" className="iconbtn" aria-label="Panier"><ShoppingBasket size={20} />{count > 0 && <span className="count">{count}</span>}</Link>
          <button className="iconbtn burger" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && (
        <div className="drawer">
          {links.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}
          <Link href={acct}>{user ? "Mon compte" : "Connexion / Inscription"}</Link>
          <Link href="/panier">Panier {count > 0 ? `(${count})` : ""}</Link>
        </div>
      )}
    </header>
  );
}
