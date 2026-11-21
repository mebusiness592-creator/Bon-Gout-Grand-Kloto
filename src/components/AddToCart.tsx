"use client";
import { useState } from "react";
import { ShoppingBasket, Check } from "lucide-react";
import { useCart } from "./CartProvider";
import type { Section } from "@/lib/types";

export function AddToCart({ id, name, price, image, section, available, withQty }: { id: string; name: string; price: number; image?: string; section: Section; available: boolean; withQty?: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  if (!available) return <button className="btn btn-ghost btn-sm" disabled>Indisponible</button>;
  const click = () => { add({ productId: id, name, price, image, section }, qty); setDone(true); setTimeout(() => setDone(false), 1600); };
  return (
    <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
      {withQty && (
        <div className="qty">
          <button type="button" aria-label="Moins" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span>{qty}</span>
          <button type="button" aria-label="Plus" onClick={() => setQty(Math.min(30, qty + 1))}>+</button>
        </div>
      )}
      <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={click}>
        {done ? <><Check size={18} /> Ajouté</> : <><ShoppingBasket size={18} /> Ajouter au panier</>}
      </button>
    </div>
  );
}
