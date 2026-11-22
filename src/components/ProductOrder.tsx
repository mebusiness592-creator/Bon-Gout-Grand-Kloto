"use client";
import { useState } from "react";
import { Check, ShoppingBasket } from "lucide-react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";
import { effectivePrice, fcfa, isPromo, isRange, priceLabel } from "@/lib/pricing";

export function ProductOrder({ p }: { p: Product }) {
  const { add } = useCart();
  const variants = p.variants || [];
  const range = isRange(p);
  const gallery = p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : [];
  const [vid, setVid] = useState(variants.length === 1 ? variants[0].id : "");
  const [shown, setShown] = useState<string | undefined>();
  const [amount, setAmount] = useState(String(p.price));
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState(""); const [done, setDone] = useState(false);
  const variant = variants.find((v) => v.id === vid);
  const main = shown || variant?.image || gallery[0];
  const out = !p.available || (typeof p.stock === "number" && p.stock <= 0);
  const unit = range ? Number(amount) : effectivePrice(p);

  function click() {
    setMsg("");
    if (variants.length && !variant) return setMsg("Veuillez choisir une option avant d'ajouter au panier.");
    if (range && (!Number.isInteger(unit) || unit < p.price || unit > (p.priceMax as number))) return setMsg(`Entrez un montant entre ${fcfa(p.price)} et ${fcfa(p.priceMax as number)}.`);
    add({ productId: p._id, variantId: variant?.id, variantLabel: variant?.label, name: p.name, price: unit, image: variant?.image || gallery[0], section: p.section }, qty);
    setDone(true); setTimeout(() => setDone(false), 1800);
  }
  return (
    <div className="split" style={{ alignItems: "start" }}>
      <div>
        <div className="detail-img">{main ? <img src={main} alt={p.name} /> : <div className="ph" style={{ fontSize: "5rem" }}>{p.section === "restaurant" ? "🍛" : "🌴"}</div>}</div>
        {gallery.length > 1 && <div className="thumbs">{gallery.map((u) => <img key={u} src={u} alt="" loading="lazy" style={{ cursor: "pointer" }} onClick={() => setShown(u)} />)}</div>}
        {(p.videos?.length ?? 0) > 0 && <div style={{ display: "grid", gap: ".6rem", marginTop: ".8rem" }}>{p.videos?.map((u) => <video key={u} src={u} controls preload="metadata" playsInline style={{ width: "100%", borderRadius: 14 }} />)}</div>}
      </div>
      <div>
        <h1>{p.name}</h1>
        {p.format && <span className="pill">{p.format}</span>}
        {p.description && <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>}
        <div className="price-row" style={{ margin: ".8rem 0" }}><strong style={{ fontSize: "1.6rem" }}>{priceLabel(p)}</strong>{isPromo(p) && <s>{fcfa(p.price)}</s>}</div>
        <span className={out ? "badge off" : "badge ok"}>{out ? "Indisponible" : "Disponible"}</span>
        {variants.length > 0 && <>
          <label style={{ marginTop: "1rem" }}>Choisissez votre association</label>
          <div className="opts">{variants.map((v) => (
            <button type="button" key={v.id} className={`opt ${v.id === vid ? "on" : ""}`} onClick={() => { setVid(v.id); setShown(undefined); }}>
              {v.image ? <img src={v.image} alt={v.label} loading="lazy" /> : <div className="ph">🍽️</div>}<span>{v.label}</span></button>))}</div></>}
        {variant?.description && <div className="panel" style={{ marginBottom: "1rem", padding: ".9rem 1rem" }}><strong>{variant.label}</strong><p className="muted" style={{ margin: ".3rem 0 0", whiteSpace: "pre-line" }}>{variant.description}</p></div>}
        {range && <><label htmlFor="amt">Votre montant (FCFA) — entre {fcfa(p.price)} et {fcfa(p.priceMax as number)}</label>
          <input id="amt" type="number" inputMode="numeric" min={p.price} max={p.priceMax as number} step={50} value={amount} onChange={(e) => setAmount(e.target.value)} /></>}
        {msg && <div className="err" role="alert">{msg}</div>}
        {out ? <button className="btn btn-ghost" disabled style={{ marginTop: "1rem" }}>Indisponible</button> : (
          <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap", marginTop: "1rem" }}>
            <div className="qty"><button type="button" aria-label="Moins" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button type="button" aria-label="Plus" onClick={() => setQty(Math.min(30, qty + 1))}>+</button></div>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={click}>{done ? <><Check size={18} /> Ajouté</> : <><ShoppingBasket size={18} /> Ajouter au panier</>}</button>
          </div>)}
      </div>
    </div>
  );
}
