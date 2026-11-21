import Link from "next/link";
import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { fcfa, fdate } from "@/lib/pricing";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/labels";
import type { Order } from "@/lib/types";

export default async function Dashboard() {
  await requireStaff();
  const db = await getDb();
  const orders = db.collection("orders");
  const revenueMatch = { status: { $ne: "cancelled" }, $or: [{ paymentStatus: "paid" }, { paymentMethod: "delivery", status: "delivered" }] };
  const [total, news, prep, deliv, done, canc, pendingPay, clients, plats, produits, rev, last, notes, recent] = await Promise.all([
    orders.countDocuments(), orders.countDocuments({ status: "pending" }), orders.countDocuments({ status: { $in: ["confirmed", "preparing"] } }),
    orders.countDocuments({ status: "delivering" }), orders.countDocuments({ status: "delivered" }), orders.countDocuments({ status: "cancelled" }),
    orders.countDocuments({ paymentStatus: "awaiting_verification" }),
    db.collection("users").countDocuments({ role: "customer" }),
    db.collection("products").countDocuments({ section: "restaurant" }), db.collection("products").countDocuments({ section: "huile" }),
    orders.aggregate([{ $match: revenueMatch }, { $group: { _id: null, sum: { $sum: "$total" } } }]).toArray(),
    orders.find().sort({ createdAt: -1 }).limit(8).toArray(),
    db.collection("notifications").find({ audience: { $ne: "user" } }).sort({ createdAt: -1 }).limit(5).toArray(),
    orders.find({ createdAt: { $gte: new Date(Date.now() - 7 * 86400000).toISOString() }, status: { $ne: "cancelled" } }).toArray(),
  ]);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 86400000); return d.toISOString().slice(0, 10); });
  const perDay = days.map((d) => ({ d, n: recent.filter((o) => String(o.createdAt).startsWith(d)).length, sum: recent.filter((o) => String(o.createdAt).startsWith(d)).reduce((s, o) => s + Number(o.total || 0), 0) }));
  const maxN = Math.max(1, ...perDay.map((x) => x.n));
  const stats: [string, string | number][] = [
    ["Commandes totales", total], ["Nouvelles", news], ["En préparation", prep], ["En livraison", deliv], ["Terminées", done], ["Annulées", canc],
    ["Chiffre d'affaires", fcfa(rev[0]?.sum || 0)], ["Paiements à vérifier", pendingPay], ["Clients", clients], ["Plats", plats], ["Produits locaux", produits],
  ];
  const lastOrders: Order[] = plain(last);
  const ns: { _id: string; title: string; message: string; createdAt: string; read: boolean }[] = plain(notes);
  return (
    <div>
      <h1 style={{ fontSize: "1.7rem" }}>Tableau de bord</h1>
      <div className="stats">{stats.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
      <p className="muted" style={{ fontSize: ".8rem", marginTop: "-.6rem" }}>Chiffre d&apos;affaires : paiements vérifiés + commandes payées à la livraison et livrées.</p>
      <div className="detailgrid">
        <div className="panel"><h3>Commandes des 7 derniers jours</h3>
          <div className="bars">{perDay.map((x) => <div key={x.d}><small>{x.n}</small><i style={{ height: `${(x.n / maxN) * 100}px` }} title={fcfa(x.sum)} />{x.d.slice(5)}</div>)}</div></div>
        <div className="panel"><h3>Notifications récentes</h3>
          {ns.length === 0 ? <p className="muted">Aucune notification.</p> : ns.map((n) => <div key={n._id} style={{ padding: ".4rem 0", borderBottom: "1px solid var(--line)", fontWeight: n.read ? 400 : 700 }}>{n.title} <span className="muted" style={{ fontSize: ".8rem", fontWeight: 400 }}>– {n.message}</span></div>)}
          <p><Link href="/admin/notifications">Voir tout</Link></p></div>
      </div>
      <h3 style={{ marginTop: "1.4rem" }}>Dernières commandes</h3>
      <div className="scroll"><table className="tbl"><thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Statut</th><th>Paiement</th><th>Date</th></tr></thead>
        <tbody>{lastOrders.length === 0 && <tr><td colSpan={6} className="muted">Aucune commande.</td></tr>}
          {lastOrders.map((o) => <tr key={o._id}><td><Link href="/admin/commandes">{o.reference}</Link></td><td>{o.customerName}</td><td>{fcfa(o.total)}</td><td>{ORDER_STATUS[o.status] || o.status}</td><td>{PAYMENT_STATUS[o.paymentStatus] || o.paymentStatus}</td><td>{fdate(o.createdAt)}</td></tr>)}</tbody></table></div>
    </div>
  );
}
