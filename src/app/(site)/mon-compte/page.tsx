import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb, plain } from "@/lib/db";
import { AccountForm } from "@/components/AccountForm";
import { fcfa, fdate } from "@/lib/pricing";
import { DELIVERY_STATUS, ORDER_STATUS, PAYMENT_STATUS } from "@/lib/labels";
import type { Order } from "@/lib/types";
export const metadata = { title: "Mon compte" };

export default async function Account() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/mon-compte");
  const db = await getDb();
  const [orders, notes] = await Promise.all([
    db.collection("orders").find({ userId: user.id }).sort({ createdAt: -1 }).limit(50).toArray(),
    db.collection("notifications").find({ audience: "user", userId: user.id }).sort({ createdAt: -1 }).limit(10).toArray(),
  ]);
  const os: Order[] = plain(orders);
  const ns: { _id: string; title: string; message: string; createdAt: string }[] = plain(notes);
  return (
    <div className="container section">
      <h1>Bonjour {user.firstName}</h1>
      {user.role !== "customer" && <p><Link href="/admin" className="btn btn-gold btn-sm">Ouvrir l&apos;administration</Link></p>}
      <div className="cols2">
        <div>
          <h2 style={{ fontSize: "1.4rem" }}>Mes commandes</h2>
          {os.length === 0 ? <div className="panel muted">Aucune commande pour le moment. <Link href="/menu">Voir le menu</Link></div> :
            os.map((o) => (
              <Link key={o._id} href={`/commande/${o._id}`} className="panel" style={{ display: "block", textDecoration: "none", marginBottom: ".8rem" }}>
                <div className="total"><strong>{o.reference}</strong><strong>{fcfa(o.total)}</strong></div>
                <div className="muted" style={{ fontSize: ".85rem" }}>{fdate(o.createdAt)}</div>
                <div className="mini">{o.items.slice(0, 5).map((i, k) => i.image ? <img key={k} src={i.image} alt={i.name} title={i.name} /> : null)}</div>
                <p style={{ margin: ".4rem 0 0" }}><span className="pill">{ORDER_STATUS[o.status] || o.status}</span> <span className="pill">{PAYMENT_STATUS[o.paymentStatus] || o.paymentStatus}</span> <span className="pill">{DELIVERY_STATUS[o.deliveryStatus || "to_prepare"]}</span></p>
              </Link>))}
          {ns.length > 0 && <><h2 style={{ fontSize: "1.4rem", marginTop: "1.5rem" }}>Notifications</h2>{ns.map((n) => <div key={n._id} className="panel" style={{ marginBottom: ".6rem" }}><strong>{n.title}</strong><div className="muted" style={{ fontSize: ".9rem" }}>{n.message} · {fdate(n.createdAt)}</div></div>)}</>}
        </div>
        <AccountForm user={{ ...user, address: user.address || "", city: user.city || "" }} />
      </div>
    </div>
  );
}
