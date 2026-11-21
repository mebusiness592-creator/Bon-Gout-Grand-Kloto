"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { fcfa } from "@/lib/pricing";

export function CartView({ deliveryFee, freeFrom }: { deliveryFee: number; freeFrom: number }) {
  const { lines, subtotal, setQty, remove, ready } = useCart();
  if (!ready) return <p className="muted">Chargement du panier…</p>;
  if (!lines.length) return <div className="panel center"><p>Votre panier est vide.</p><Link href="/menu" className="btn btn-primary">Voir le menu</Link></div>;
  const fee = freeFrom > 0 && subtotal >= freeFrom ? 0 : deliveryFee;
  const groups: [string, typeof lines][] = [["Restaurant Bon Goût", lines.filter((l) => l.section === "restaurant")], ["Production locale", lines.filter((l) => l.section === "huile")]];
  return (
    <div className="cols2">
      <div className="panel">
        {groups.map(([title, ls]) => ls.length > 0 && (
          <section key={title}><h3 style={{ marginTop: ".6rem" }}>{title}</h3>
            {ls.map((l) => (
              <div className="line" key={l.productId}>
                {l.image ? <img src={l.image} alt="" /> : <div className="ph">{l.section === "restaurant" ? "🍛" : "🌴"}</div>}
                <div><strong>{l.name}</strong><div className="muted" style={{ fontSize: ".85rem" }}>{fcfa(l.price)}</div>
                  <div className="qty" style={{ marginTop: ".3rem" }}><button aria-label="Moins" onClick={() => setQty(l.productId, l.quantity - 1)}>−</button><span>{l.quantity}</span><button aria-label="Plus" onClick={() => setQty(l.productId, l.quantity + 1)}>+</button></div></div>
                <div style={{ textAlign: "right" }}><strong>{fcfa(l.price * l.quantity)}</strong><br /><button className="btn btn-sm btn-danger" onClick={() => remove(l.productId)} aria-label="Retirer"><Trash2 size={14} /></button></div>
              </div>
            ))}</section>
        ))}
      </div>
      <div className="panel">
        <h3>Récapitulatif</h3>
        <div className="total"><span>Sous-total</span><span>{fcfa(subtotal)}</span></div>
        <div className="total"><span>Livraison</span><span>{fee ? fcfa(fee) : "Offerte / à confirmer"}</span></div>
        <div className="total big"><span>Total</span><span>{fcfa(subtotal + fee)}</span></div>
        <p className="muted" style={{ fontSize: ".8rem" }}>Le montant définitif est recalculé par le serveur lors de la validation.</p>
        <Link href="/commande" className="btn btn-primary" style={{ width: "100%" }}>Valider ma commande</Link>
        <Link href="/menu" className="btn btn-ghost" style={{ width: "100%", marginTop: ".6rem", color: "var(--brown)" }}>Continuer mes achats</Link>
      </div>
    </div>
  );
}
