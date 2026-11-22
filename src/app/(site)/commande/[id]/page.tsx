import Link from "next/link";
import { getDb, oid, plain } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { buildUssd } from "@/lib/ussd";
import { fcfa, fdate } from "@/lib/pricing";
import { DELIVERY_STATUS, ORDER_STATUS, PAYMENT_STATUS } from "@/lib/labels";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { UssdPay } from "@/components/UssdPay";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ma commande" };

export default async function Confirmation({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ id }, { t }] = await Promise.all([params, searchParams]);
  const _id = oid(id);
  const [user, s] = await Promise.all([getCurrentUser(), getSettings()]);
  const doc = _id ? await (await getDb()).collection("orders").findOne({ _id }) : null;
  const allowed = doc && ((t && t === doc.accessToken) || (user && (doc.userId === user.id || user.role !== "customer")));
  if (!doc || !allowed) {
    return <div className="container section"><h1>Commande introuvable</h1><p className="muted">Le lien est invalide ou vous n&apos;avez pas accès à cette commande.</p><Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link></div>;
  }
  const o: Order = plain(doc);
  const code = o.paymentMethod === "ussd" ? buildUssd(o.operator, o.total, o.reference, o.phone) : null;
  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <span className="badge ok">Commande enregistrée</span>
      <h1>Merci {o.customerName.split(" ")[0]} !</h1>
      <p>Numéro de commande : <strong>{o.reference}</strong> · {fdate(o.createdAt)}</p>
      <div className="panel">
        <p><StatusBadge kind="order" value={o.status} withKind /><StatusBadge kind="payment" value={o.paymentStatus} withKind /><StatusBadge kind="delivery" value={o.deliveryStatus} withKind /></p>
        {o.items.map((i, k) => <div className="oline" key={k}>{i.image ? <img src={i.image} alt="" /> : <div className="ph">🍽️</div>}<span>{i.quantity} × {i.name}{i.variantLabel ? <><br /><small className="muted">{i.variantLabel}</small></> : null}</span><strong>{fcfa(i.quantity * i.unitPrice)}</strong></div>)}
        {typeof o.deliveryFee === "number" && <div className="total"><span>Livraison</span><span>{fcfa(o.deliveryFee)}</span></div>}
        <div className="total big"><span>Total</span><span>{fcfa(o.total)}</span></div>
        <p className="muted">Livraison : {o.address}{o.city ? `, ${o.city}` : ""}{o.location ? " (position GPS enregistrée)" : ""}</p>
      </div>
      {o.paymentMethod === "ussd" && ["pending", "awaiting_verification"].includes(o.paymentStatus) && <UssdPay id={o._id} token={t || ""} code={code} instructions={s.paymentInstructions} status={o.paymentStatus} reference={o.reference} amount={o.total} />}
      {o.paymentMethod === "delivery" && <p className="muted">Vous paierez à la réception de votre commande.</p>}
      <p style={{ marginTop: "1.5rem", display: "flex", gap: ".6rem", flexWrap: "wrap" }}><Link href="/menu" className="btn btn-primary">Continuer mes achats</Link>{user && <Link href="/mon-compte" className="btn btn-ghost" style={{ color: "var(--brown)" }}>Mes commandes</Link>}</p>
    </div>
  );
}
