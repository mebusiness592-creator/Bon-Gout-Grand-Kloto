"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBasket, User, Utensils, ShieldCheck } from "lucide-react";
import { useCart } from "./CartProvider";
import { Avatar } from "./Avatar";
import { NotificationBell, type Notif } from "./NotificationBell";

const links = [
  ["/", "Accueil"], ["/restaurant", "Restaurant"], ["/menu", "Menu"], ["/production-locale", "Produits locaux"],
  ["/produits", "Boutique locale"], ["/contact", "Contact"],
];
export function SiteHeader({ name, user, unread = 0, notes = [] }: { name: string; user: { name: string; role: string; avatar?: string } | null; unread?: number; notes?: Notif[] }) {
  const path = usePathname();
  const { count } = useCart();
  const staff = user && user.role !== "customer";
  return (
    <header className="topbar">
      <div className="container in">
        <Link href="/" className="brand"><span className="logo"><Utensils size={20} /></span><span>{name.replace("DU GRAND KLOTO", "").trim()}<br /><small style={{ fontWeight: 600, color: "var(--flame)" }}>DU GRAND KLOTO</small></span></Link>
        <nav className="nav" aria-label="Navigation principale">
          {links.map(([h, l]) => <Link key={h} href={h} className={path === h ? "on" : ""}>{l}</Link>)}
        </nav>
        <div className="tools">
          {staff && <Link href="/admin" className="iconbtn" aria-label="Administration" title="Administration"><ShieldCheck size={20} /></Link>}
          {user && <NotificationBell items={notes} unread={unread} />}
          <Link href={user ? "/mon-compte" : "/connexion"} className="iconbtn profile-shortcut" aria-label="Mon compte" title={user ? user.name : "Se connecter"}>{user?.avatar ? <Avatar src={user.avatar} name={user.name} size={34} /> : <User size={20} />}</Link>
          <Link href="/panier" className="iconbtn desk" aria-label="Panier"><ShoppingBasket size={20} />{count > 0 && <span className="count">{count}</span>}</Link>
        </div>
      </div>
    </header>
  );
}
