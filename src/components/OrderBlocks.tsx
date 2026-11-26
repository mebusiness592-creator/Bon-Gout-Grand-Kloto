import type { ReactNode } from "react";
import { fcfa, fdate } from "@/lib/pricing";
import { SECTION_LABEL } from "@/lib/labels";
import type { Order, OrderItem, OrderOption } from "@/lib/types";

/** Styles du formulaire des plats et des fiches de commande (intégrés : aucun fichier CSS séparé à créer). */
export const DISH_CSS = `/* Formulaire des plats (administration) et fiches de commande détaillées */
.dish-sheet{width:min(940px,100%)!important;padding:0!important;background:var(--cream)!important;overflow:hidden}
.dish-head{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:.6rem;padding:.8rem 1.1rem;background:#fff;border-bottom:1px solid var(--line)}
.dish-head h2{margin:0;font-size:1.2rem}
.dish-body{padding:1rem 1.1rem 1.4rem;display:grid;gap:.9rem;max-height:calc(100dvh - 150px);overflow-y:auto}
.dsec{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.dsec-h{display:flex;align-items:center;gap:.7rem;width:100%;padding:.85rem 1rem;border:0;background:none;font:inherit;text-align:left;cursor:pointer;color:var(--ink)}
.dsec-n{flex:none;width:28px;height:28px;border-radius:50%;background:var(--brown);color:#fff;display:grid;place-items:center;font-size:.8rem;font-weight:800}
.dsec-t{flex:1;min-width:0}.dsec-t strong{display:block;font-size:1rem}.dsec-t small{color:var(--muted)}
.dsec-c{flex:none;background:var(--sand);border-radius:99px;padding:.1rem .6rem;font-size:.75rem;font-weight:800}
.dsec-b{padding:.2rem 1rem 1rem;border-top:1px solid var(--line)}
.dgrid{display:grid;gap:.8rem}@media(min-width:700px){.dgrid.two{grid-template-columns:1fr 1fr}.dgrid.three{grid-template-columns:1fr 1fr 1fr}}
.ditem{border:1px solid var(--line);border-radius:14px;padding:.8rem;margin-top:.7rem;background:#fffdf9}
.ditem-top{display:flex;gap:.6rem;align-items:center}.ditem-top input{flex:1}
.ditem .free{display:flex;gap:.5rem;align-items:center;margin:.5rem 0;padding:.45rem .7rem;border-radius:10px;background:#f1f8f2;border:1px solid #cfe5d2}
.ditem .free input{width:auto}.ditem .free label{margin:0}
.dpricebox{background:var(--sand);border-radius:12px;padding:.6rem .8rem;margin:.5rem 0}
.dfoot{position:sticky;bottom:0;display:flex;gap:.6rem;justify-content:flex-end;padding:.8rem 1.1rem;background:#fff;border-top:1px solid var(--line)}
.dchips{display:flex;gap:.3rem;flex-wrap:wrap}.dchip{font-size:.7rem;font-weight:800;padding:.1rem .5rem;border-radius:99px;background:var(--sand)}
/* fiche de commande détaillée */
.ocard{border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden;margin:.6rem 0}
.ocard-h{display:grid;grid-template-columns:72px 1fr auto;gap:.7rem;align-items:center;padding:.7rem;background:#fff8ee;border-bottom:1px solid var(--line)}
.ocard-h img,.ocard-h .ph{width:72px;height:72px;border-radius:12px;object-fit:cover;display:grid;place-items:center;font-size:1.6rem;background:var(--sand)}
.ocard-b{padding:.5rem .8rem .7rem;display:grid;gap:.5rem}
.osec h5{margin:.2rem 0;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.orow{display:grid;grid-template-columns:34px 1fr auto;gap:.5rem;align-items:center;padding:.2rem 0}
.orow img,.orow .th{width:34px;height:34px;border-radius:8px;object-fit:cover;background:var(--sand);display:grid;place-items:center;font-size:.9rem}
.orow small{color:var(--muted);display:block}
.tagfree{font-size:.7rem;font-weight:800;padding:.1rem .5rem;border-radius:99px;background:#dcfce7;color:#166534}
.tagpaid{font-size:.7rem;font-weight:800;padding:.1rem .5rem;border-radius:99px;background:#fef9c3;color:#a16207}
.orecap{border:2px solid var(--brown);border-radius:14px;padding:.6rem .9rem;margin-top:.6rem}
.otitle{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:.4rem;margin:0 0 .3rem}
.otitle h3{margin:0;letter-spacing:.02em}
`;

const sum = (o?: OrderOption[]) => (o || []).reduce((s, x) => s + (x.amount || 0), 0);

function Row({ o }: { o: OrderOption }) {
  return (
    <div className="orow">
      {o.image ? <img src={o.image} alt="" /> : <span className="th">🍽️</span>}
      <span><strong>{o.label}</strong>{o.description && <small>{o.description}</small>}</span>
      {o.amount ? <span className="tagpaid">{fcfa(o.amount)}</span> : <span className="tagfree">{o.role === "sauce" ? "Gratuite" : "Inclus"}</span>}
    </div>
  );
}

/** Bloc détaillé d'un plat : ce que la cuisine doit préparer, élément par élément. Compatible avec les anciennes commandes. */
export function OrderItemBlock({ i }: { i: OrderItem }) {
  const opts = i.options || [];
  const variants = opts.filter((o) => o.role === "variant");
  const sauces = opts.filter((o) => o.role === "sauce");
  const extras = opts.filter((o) => o.role === "extra");
  const others = opts.filter((o) => !o.role);
  const dish = typeof i.dishAmount === "number" ? i.dishAmount : i.unitPrice - sum(opts);
  const groupsOther = [...new Set(others.map((o) => o.groupLabel))];
  return (
    <div className="ocard">
      <div className="ocard-h">
        {i.image ? <img src={i.image} alt={i.name} /> : <div className="ph">🍽️</div>}
        <div><strong style={{ fontSize: "1.05rem" }}>{i.name}</strong><div className="muted">Quantité : <strong>{i.quantity}</strong></div></div>
        <div style={{ textAlign: "right" }}><div className="muted" style={{ fontSize: ".75rem" }}>Total du plat</div><strong>{fcfa(i.quantity * i.unitPrice)}</strong></div>
      </div>
      <div className="ocard-b">
        <div className="osec"><h5>Plat</h5>
          <div className="orow" style={{ gridTemplateColumns: "1fr auto" }}><span>{variants.length ? <>Variante : <strong>{variants.map((v) => v.label).join(", ")}</strong></> : <>Montant du plat</>}{variants[0]?.description && <small>{variants[0].description}</small>}</span><span className="tagpaid">{fcfa(dish)} {i.quantity > 1 ? "/ unité" : ""}</span></div></div>
        {sauces.length > 0 && <div className="osec"><h5>Sauces</h5>{sauces.map((o, k) => <Row key={k} o={o} />)}</div>}
        {extras.length > 0 && <div className="osec"><h5>Viandes, poissons et accompagnements</h5>{extras.map((o, k) => <Row key={k} o={o} />)}</div>}
        {groupsOther.map((g) => <div className="osec" key={g}><h5>{g}</h5>{others.filter((o) => o.groupLabel === g).map((o, k) => <Row key={k} o={o} />)}</div>)}
        {!opts.length && i.variantLabel && <div className="osec"><h5>Choix du client</h5><div>{i.variantLabel}</div></div>}
        {i.quantity > 1 && <div className="muted" style={{ fontSize: ".82rem" }}>Prix par unité : {fcfa(i.unitPrice)} × {i.quantity}</div>}
      </div>
    </div>
  );
}

/** Présentation complète d'une commande : en-tête, client, un bloc par plat, récapitulatif financier. */
export function OrderBlocks({ order, badges }: { order: Order; badges?: ReactNode }) {
  const subtotal = typeof order.subtotal === "number" ? order.subtotal : order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: DISH_CSS }} />
      <div className="otitle"><h3>COMMANDE #{order.reference}</h3><small className="muted">{fdate(order.createdAt)} · {SECTION_LABEL[order.section] || order.section}</small></div>
      {badges}
      <div className="ocard" style={{ padding: ".7rem .9rem" }}>
        <strong>{order.customerName}</strong> · <a href={`tel:${order.phone}`}>{order.phone}</a>
        <div className="muted">{order.address}{order.city ? `, ${order.city}` : ""}</div>
        {order.notes && <div style={{ marginTop: ".3rem" }}><em>Note du client : {order.notes}</em></div>}
      </div>
      {order.items.map((i, k) => <OrderItemBlock key={k} i={i} />)}
      <div className="orecap">
        <div className="total"><span>Sous-total</span><span>{fcfa(subtotal)}</span></div>
        {typeof order.deliveryFee === "number" && <div className="total"><span>Livraison</span><span>{fcfa(order.deliveryFee)}</span></div>}
        <div className="total big"><span>TOTAL</span><span>{fcfa(order.total)}</span></div>
        <div className="muted" style={{ fontSize: ".85rem" }}>Paiement : <strong>{order.paymentMethod === "ussd" ? `Mobile money ${order.operator || ""}` : "À la livraison"}</strong></div>
      </div>
    </div>
  );
}