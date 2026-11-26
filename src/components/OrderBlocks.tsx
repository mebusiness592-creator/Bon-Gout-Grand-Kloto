import "../styles/dishes.css";
import type { ReactNode } from "react";
import { fcfa, fdate } from "@/lib/pricing";
import { SECTION_LABEL } from "@/lib/labels";
import type { Order, OrderItem, OrderOption } from "@/lib/types";

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