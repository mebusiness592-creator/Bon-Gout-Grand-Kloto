"use client";
import { useState } from "react";
import { Check, ShoppingBasket } from "lucide-react";
import { useCart, type CartOption } from "./CartProvider";
import { Slides } from "./Slides";
import type { OptionGroup, OptionItem, Product } from "@/lib/types";
import { groupsOf, itemKind } from "@/lib/options";
import { effectivePrice, fcfa, isPromo, isRange, priceLabel } from "@/lib/pricing";

type Sel = Record<string, Record<string, string>>; // groupe -> accompagnement -> montant saisi (texte)

export function ProductOrder({ p }: { p: Product }) {
  const { add } = useCart();
  const rank = (g: OptionGroup) => (g.role === "variant" ? 0 : g.role === "sauce" ? 1 : g.role === "extra" ? 2 : 3);
  const groups = [...groupsOf(p)].sort((a, b) => rank(a) - rank(b));
  const vg = groups.find((g) => g.role === "variant");
  const range = isRange(p);
  const media = [...(p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : []), ...(p.videos || [])];
  const [sel, setSel] = useState<Sel>({});
  const [amount, setAmount] = useState(String(p.price));
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState(""); const [done, setDone] = useState(false);
  const out = !p.available || (typeof p.stock === "number" && p.stock <= 0);

  const amountOf = (it: OptionItem, text: string) => { const k = itemKind(it); return k === "none" ? 0 : k === "fixed" ? (it.priceMin as number) : Number(text); };
  // La variante choisie, si elle a un prix, REMPLACE le prix du plat ; sinon on utilise le prix (ou la fourchette) du plat.
  const vItem = vg?.items.find((it) => sel[vg.id]?.[it.id] !== undefined);
  const vPriced = Boolean(vg && vItem && itemKind(vItem) !== "none");
  const dishUnit = vPriced && vg && vItem ? amountOf(vItem, sel[vg.id][vItem.id]) : range ? Number(amount) : effectivePrice(p);
  const extras = groups.reduce((s, g) => (g.role === "variant" ? s : s + g.items.reduce((t, it) => { const t0 = sel[g.id]?.[it.id]; return t0 === undefined ? t : t + (amountOf(it, t0) || 0); }, 0)), 0);
  const unit = (Number.isFinite(dishUnit) ? dishUnit : 0) + extras;

  function toggle(g: OptionGroup, it: OptionItem) {
    setSel((prev) => {
      const cur = { ...(prev[g.id] || {}) };
      if (cur[it.id] !== undefined) { if (!g.multiple && g.required) return prev; delete cur[it.id]; }
      else { if (!g.multiple) for (const k of Object.keys(cur)) delete cur[k]; cur[it.id] = typeof it.priceMin === "number" ? String(it.priceMin) : ""; }
      return { ...prev, [g.id]: cur };
    });
  }
  function setAmt(g: OptionGroup, it: OptionItem, v: string) { setSel((prev) => ({ ...prev, [g.id]: { ...(prev[g.id] || {}), [it.id]: v } })); }

  function click() {
    setMsg("");
    if (range && !vPriced && (!Number.isInteger(dishUnit) || dishUnit < p.price || dishUnit > (p.priceMax as number))) return setMsg(`Entrez un montant entre ${fcfa(p.price)} et ${fcfa(p.priceMax as number)}.`);
    const options: CartOption[] = [];
    for (const g of groups) {
      const chosen = g.items.filter((it) => sel[g.id]?.[it.id] !== undefined);
      if (g.required && !chosen.length) return setMsg(`Veuillez choisir : ${g.label}.`);
      for (const it of chosen) {
        const k = itemKind(it); const a = amountOf(it, sel[g.id][it.id]);
        if (k === "range" && (!Number.isInteger(a) || a < (it.priceMin as number) || a > (it.priceMax as number))) return setMsg(`« ${it.label} » : entrez un montant entre ${fcfa(it.priceMin as number)} et ${fcfa(it.priceMax as number)}.`);
        options.push({ groupId: g.id, groupLabel: g.label, itemId: it.id, label: it.label, ...(k === "none" ? {} : { amount: a }) });
      }
    }
    const summary = options.map((o) => (o.amount ? `${o.label} (${fcfa(o.amount)})` : o.label)).join(" · ");
    add({ productId: p._id, name: p.name, price: unit, baseUnit: range && !vPriced ? dishUnit : undefined, image: media.find((u) => !/\.(mp4|webm|mov)(\?.*)?$/i.test(u)), section: p.section, options, variantLabel: summary || undefined }, qty);
    setDone(true); setTimeout(() => setDone(false), 1800);
  }
  return (
    <div className="split" style={{ alignItems: "start" }}>
      <div>
        <div className="detail-img" style={{ position: "relative" }}>{media.length ? <Slides images={media} /> : <div className="ph" style={{ fontSize: "5rem" }}>{p.section === "restaurant" ? "🍛" : "🌴"}</div>}</div>
      </div>
      <div>
        <h1>{p.name}</h1>
        {p.format && <span className="pill">{p.format}</span>}
        {p.description && <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>}
        <div className="price-row" style={{ margin: ".8rem 0" }}><strong style={{ fontSize: "1.6rem" }}>{priceLabel(p)}</strong>{isPromo(p) && <s>{fcfa(p.price)}</s>}</div>
        <span className={out ? "badge off" : "badge ok"}>{out ? "Indisponible" : "Disponible"}</span>

        <h3 style={{ marginTop: "1.2rem" }}>Votre commande</h3>
        <div className="acc on" style={{ cursor: "default" }}>
          <div className="acc-main" style={{ cursor: "default" }}>
            <span className="acc-ind">✓</span>
            {media[0] && !/\.(mp4|webm|mov)(\?.*)?$/i.test(media[0]) ? <img src={media[0]} alt="" /> : <span className="ph">🍽️</span>}
            <span className="acc-txt"><strong>{p.name}</strong><small>Sélectionné automatiquement — choisissez la quantité ci-dessous</small></span>
          </div>
          {range && !vPriced && <div className="acc-amt"><label htmlFor="amt">Indiquez le montant souhaité pour le plat (FCFA) — entre {fcfa(p.price)} et {fcfa(p.priceMax as number)}</label>
            <input id="amt" type="number" inputMode="numeric" min={p.price} max={p.priceMax as number} step={50} value={amount} onChange={(e) => setAmount(e.target.value)} /></div>}
        </div>

        {groups.map((g) => (
          <section key={g.id} style={{ marginTop: "1rem" }}>
            <h3 style={{ marginBottom: ".2rem" }}>{g.label} <span className={g.required ? "badge promo" : "badge ok"} style={{ fontSize: ".7rem" }}>{g.required ? "Obligatoire" : "Facultatif"}</span></h3>
            <small className="muted">{g.role === "variant" ? "Choisissez votre variante" : g.multiple ? "Plusieurs choix possibles" : "Un seul choix"}</small>
            <div style={{ display: "grid", gap: ".5rem", marginTop: ".4rem" }}>
              {g.items.map((it) => {
                const on = sel[g.id]?.[it.id] !== undefined; const k = itemKind(it);
                return (
                  <div key={it.id} className={`acc ${on ? "on" : ""}`}>
                    <button type="button" className="acc-main" onClick={() => toggle(g, it)} aria-pressed={on}>
                      <span className={`acc-ind ${g.multiple ? "sq" : ""}`}>{on ? "✓" : ""}</span>
                      {it.image ? <img src={it.image} alt={it.label} loading="lazy" /> : <span className="ph">🍽️</span>}
                      <span className="acc-txt"><strong>{it.label}</strong>{it.description && <small>{it.description}</small>}
                        <small>{k === "none" ? (g.role === "sauce" ? "Gratuite" : "Inclus") : k === "fixed" ? `${g.role === "variant" ? "" : "+ "}${fcfa(it.priceMin as number)}` : `Vous choisissez : de ${fcfa(it.priceMin as number)} à ${fcfa(it.priceMax as number)}`}</small></span>
                    </button>
                    {on && k === "range" && <div className="acc-amt"><label>Montant pour « {it.label} » (FCFA)</label>
                      <input type="number" inputMode="numeric" min={it.priceMin as number} max={it.priceMax as number} step={50} value={sel[g.id][it.id]} onChange={(e) => setAmt(g, it, e.target.value)} /></div>}
                  </div>);
              })}
            </div>
          </section>))}

        {msg && <div className="err" role="alert" style={{ marginTop: ".8rem" }}>{msg}</div>}
        {out ? <button className="btn btn-ghost" disabled style={{ marginTop: "1rem" }}>Indisponible</button> : (
          <>
            <div className="total big" style={{ marginTop: "1rem" }}><span>Total ({qty} × {fcfa(unit)})</span><span>{fcfa(unit * qty)}</span></div>
            <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap", marginTop: ".6rem" }}>
              <div className="qty"><button type="button" aria-label="Moins" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button type="button" aria-label="Plus" onClick={() => setQty(Math.min(30, qty + 1))}>+</button></div>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={click}>{done ? <><Check size={18} /> Ajouté</> : <><ShoppingBasket size={18} /> Ajouter au panier</>}</button>
            </div>
          </>)}
      </div>
    </div>
  );
}