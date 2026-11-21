"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, Leaf, ShoppingBasket, User } from "lucide-react";
import { useCart } from "./CartProvider";

export function MobileTabBar({ accountHref }: { accountHref: string }) {
  const path = usePathname();
  const { count } = useCart();
  const items = [
    { h: "/", l: "Accueil", I: Home }, { h: "/menu", l: "Menu", I: Utensils }, { h: "/produits", l: "Produits", I: Leaf },
    { h: "/panier", l: "Panier", I: ShoppingBasket }, { h: accountHref, l: "Compte", I: User },
  ];
  const on = (h: string) => (h === "/" ? path === "/" : path.startsWith(h) || (h === "/produits" && path.startsWith("/production")));
  return (
    <nav className="tabbar" aria-label="Navigation mobile">
      {items.map(({ h, l, I }) => (
        <Link key={h} href={h} className={on(h) ? "on" : ""}><I size={22} />{l}{h === "/panier" && count > 0 && <span className="count">{count}</span>}</Link>
      ))}
    </nav>
  );
}
