"use client";
import { useState } from "react";
import { Check, ChevronDown, ShoppingBasket } from "lucide-react";
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
  const hasVariants = Boolean(vg && vg.items.length > 0);
  const range = !hasVariants && isRange(p);
  const media = [...(p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : []), ...(p.videos || [])];
  const [sel, setSel] = useState<Sel>({});
  const [amount, setAmount] = useState(String(p.price));
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState(""); const [done, setDone] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [openG, setOpenG] = useState<Record<string, boolean>>({});
  const out = !p.available || (typeof p.stock === "number" && p.stock <= 0);

  const amountOf = (it: OptionItem, text: string) => { const k = itemKind(it); return k === "none" ? 0 : k === "fixed" ? (it.priceMin as number) : Number(text); };
  // Avec des variantes, seul le prix de la variante choisie est utilisé.
  const vItem = vg?.items.find((it) => sel[vg.id]?.[it.id] !== undefined);
  const vPriced = Boolean(hasVariants && vItem && itemKind(vItem) !== "none");
  const dishUnit = hasVariants ? (vPriced && vg && vItem ? amountOf(vItem, sel[vg.id][vItem.id]) : 0) : range ? Number(amount) : effectivePrice(p);
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
    if (hasVariants && (!vItem || !vPriced)) return setMsg("Veuillez choisir une variante dont le prix est correctement configuré.");
    if (range && (!Number.isInteger(dishUnit) || dishUnit < p.price || dishUnit > (p.priceMax as number))) return setMsg(`Entrez un montant entre ${fcfa(p.price)} et ${fcfa(p.priceMax as number)}.`);
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
    add({ productId: p._id, name: p.name, price: unit, baseUnit: range && !hasVariants ? dishUnit : undefined, image: media.find((u) => !/\.(mp4|webm|mov)(\?.*)?$/i.test(u)), section: p.section, options, variantLabel: summary || undefined }, qty);
    setDone(true); setTimeout(() => setDone(false), 1800);
  }
  const PD_CSS = `.pd{display:grid;gap:1rem}
.pd-media{position:relative;width:100%;aspect-ratio:16/10;max-height:230px;border-radius:16px;overflow:hidden;background:var(--sand)}
.pd-media .ph{position:absolute;inset:0;display:grid;place-items:center;font-size:3.5rem}
.pd-main{display:grid;gap:.7rem;min-width:0}
.pd-title{margin:0;font-size:1.55rem}
.pd-meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}.pd-price{font-size:1.25rem;color:var(--red)}
.pd-desc{margin:0;color:#4a3a2e;line-height:1.5;white-space:pre-line;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.pd-desc.open{display:block;-webkit-line-clamp:unset}
.pd-more{border:0;background:none;color:var(--flame);font-weight:800;padding:.2rem 0;cursor:pointer;font:inherit}
.pd-h{font-size:1.1rem;margin:.4rem 0 0}
.pd-dish{display:flex;align-items:center;gap:.7rem;padding:.55rem .7rem;border:2px solid var(--flame);border-radius:14px;background:#fff4ec}
.pd-dish img,.pd-dish .ph{width:46px;height:46px;border-radius:10px;object-fit:cover;flex:none;display:grid;place-items:center;background:var(--sand)}
.pd-dish small{display:block;color:var(--muted);font-size:.76rem}
.pdg{border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden}
.pdg-h{display:flex;align-items:center;gap:.6rem;width:100%;padding:.7rem .85rem;border:0;background:none;font:inherit;text-align:left;cursor:pointer;color:var(--ink)}
.pdg-t{flex:1;min-width:0;display:grid}.pdg-t small{color:var(--muted);font-size:.76rem}
.pdg-req,.pdg-opt{flex:none;font-size:.68rem;font-weight:800;padding:.1rem .5rem;border-radius:99px}.pdg-req{background:#ffedd5;color:#c2410c}.pdg-opt{background:#dcfce7;color:#166534}
.pdg-c{flex:none;min-width:22px;height:22px;border-radius:99px;background:var(--flame);color:#fff;font-size:.74rem;font-weight:800;display:grid;place-items:center}
.pdg-ch{flex:none;transition:transform .2s;color:var(--muted)}.pdg-ch.up{transform:rotate(180deg)}
.pdg-b{padding:0 .6rem .7rem;display:grid;gap:.45rem}
.pd .acc{border-radius:12px}.pd .acc-main{padding:.45rem .6rem;gap:.55rem}
.pd .acc-main img,.pd .acc-main .ph{width:46px;height:46px;border-radius:9px}
.pd .acc-txt strong{font-size:.92rem;line-height:1.2}.pd .acc-txt small{font-size:.74rem;line-height:1.25}
.pd .acc-txt .dsc{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pd .acc.on .acc-txt .dsc{-webkit-line-clamp:3}
.pd-bar{display:grid;grid-template-columns:1fr auto;gap:.5rem .8rem;align-items:center;position:sticky;bottom:calc(64px + env(safe-area-inset-bottom));z-index:40;background:#fff;border:1px solid var(--line);border-radius:16px;padding:.7rem .8rem;box-shadow:0 -8px 22px rgba(59,36,24,.14)}
.pd-bar .btn{grid-column:1/-1}.pd-tot small{display:block;color:var(--muted);font-size:.76rem}.pd-tot strong{font-size:1.2rem}
@media(min-width:900px){.pd{grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);align-items:start;gap:1.5rem}.pd-media{aspect-ratio:4/3;max-height:none;position:sticky;top:90px}.pd-bar{grid-column:2}}
@media(min-width:1080px){.pd-bar{bottom:12px}}`;
  const longDesc = (p.description || "").length > 140;
  const isOpen = (g: OptionGroup, gi: number) => openG[g.id] ?? (Boolean(g.required) || gi === 0);
  const hint = (g: OptionGroup) => (g.role === "variant" ? "Choisissez votre variante" : g.multiple ? "Plusieurs choix possibles" : "Un seul choix");
  return (
    <div className="pd">
      <style dangerouslySetInnerHTML={{ __html: PD_CSS }} />
      <div className="pd-media">{media.length ? <Slides images={media} /> : <div className="ph">{p.section === "restaurant" ? "🍛" : "🌴"}</div>}</div>

      <div className="pd-main">
        <h1 className="pd-title">{p.name}</h1>
        <div className="pd-meta">
          <strong className="pd-price">{hasVariants ? "Prix selon variante" : priceLabel(p)}</strong>{!hasVariants && isPromo(p) && <s className="muted">{fcfa(p.price)}</s>}
          <span className={out ? "badge off" : "badge ok"}>{out ? "Indisponible" : "Disponible"}</span>{p.format && <span className="pill">{p.format}</span>}
        </div>
        {p.description && <div><p className={`pd-desc ${descOpen ? "open" : ""}`}>{p.description}</p>{longDesc && <button type="button" className="pd-more" onClick={() => setDescOpen(!descOpen)}>{descOpen ? "Réduire" : "Lire la suite"}</button>}</div>}

        <h2 className="pd-h">Votre commande</h2>
        <div className="pd-dish">
          {media[0] && !/\.(mp4|webm|mov)(\?.*)?$/i.test(media[0]) ? <img src={media[0]} alt="" /> : <span className="ph">🍽️</span>}
          <span><strong>✓ {p.name}</strong><small>Sélectionné automatiquement — choisissez la quantité en bas</small></span>
        </div>
        {range && <div className="pdg" style={{ padding: ".7rem .85rem" }}><label htmlFor="amt" style={{ marginTop: 0 }}>Montant souhaité pour le plat (FCFA) — entre {fcfa(p.price)} et {fcfa(p.priceMax as number)}</label>
          <input id="amt" type="number" inputMode="numeric" min={p.price} max={p.priceMax as number} step={50} value={amount} onChange={(e) => setAmount(e.target.value)} /></div>}

        {groups.map((g, gi) => {
          const open = isOpen(g, gi); const n = Object.keys(sel[g.id] || {}).length;
          return (
            <section key={g.id} className="pdg">
              <button type="button" className="pdg-h" aria-expanded={open} onClick={() => setOpenG((s) => ({ ...s, [g.id]: !open }))}>
                <span className="pdg-t"><strong>{g.label}</strong><small>{hint(g)}</small></span>
                <span className={g.required ? "pdg-req" : "pdg-opt"}>{g.required ? "Obligatoire" : "Facultatif"}</span>
                {n > 0 && <span className="pdg-c">{n}</span>}
                <ChevronDown size={18} className={`pdg-ch ${open ? "up" : ""}`} />
              </button>
              {open && (
                <div className="pdg-b">
                  {g.items.map((it) => {
                    const on = sel[g.id]?.[it.id] !== undefined; const k = itemKind(it);
                    return (
                      <div key={it.id} className={`acc ${on ? "on" : ""}`}>
                        <button type="button" className="acc-main" onClick={() => toggle(g, it)} aria-pressed={on}>
                          <span className={`acc-ind ${g.multiple ? "sq" : ""}`}>{on ? "✓" : ""}</span>
                          {it.image ? <img src={it.image} alt={it.label} loading="lazy" /> : <span className="ph">🍽️</span>}
                          <span className="acc-txt"><strong>{it.label}</strong>{it.description && <small className="dsc">{it.description}</small>}
                            <small>{k === "none" ? (g.role === "sauce" ? "Gratuite" : "Inclus") : k === "fixed" ? `${g.role === "variant" ? "" : "+ "}${fcfa(it.priceMin as number)}` : `De ${fcfa(it.priceMin as number)} à ${fcfa(it.priceMax as number)}`}</small></span>
                        </button>
                        {on && k === "range" && <div className="acc-amt"><label>Votre montant pour « {it.label} » (FCFA)</label>
                          <input type="number" inputMode="numeric" min={it.priceMin as number} max={it.priceMax as number} step={50} value={sel[g.id][it.id]} onChange={(e) => setAmt(g, it, e.target.value)} /></div>}
                      </div>);
                  })}
                </div>)}
            </section>);
        })}
        {msg && <div className="err" role="alert" style={{ margin: 0 }}>{msg}</div>}
      </div>

      <div className="pd-bar">
        {out ? <button className="btn btn-ghost" disabled>Indisponible</button> : (
          <>
            <div className="pd-tot"><small>Total ({qty} × {fcfa(unit)})</small><strong>{fcfa(unit * qty)}</strong></div>
            <div className="qty"><button type="button" aria-label="Moins" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button type="button" aria-label="Plus" onClick={() => setQty(Math.min(30, qty + 1))}>+</button></div>
            <button type="button" className="btn btn-primary" onClick={click}>{done ? <><Check size={18} /> Ajouté au panier</> : <><ShoppingBasket size={18} /> Ajouter au panier</>}</button>
          </>)}
      </div>
    </div>
  );
}