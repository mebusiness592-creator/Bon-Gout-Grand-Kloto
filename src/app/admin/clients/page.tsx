import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { fcfa, fdate } from "@/lib/pricing";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";
export const metadata = { title: "Clients" };

type C = { _id: string; firstName: string; lastName: string; email: string; phone: string; active?: boolean; createdAt?: string; address?: string; city?: string; avatar?: string };
export default async function Page({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  await requireStaff();
  const { u } = await searchParams;
  const db = await getDb();
  const users = plain<C[]>(await db.collection("users").find({ role: "customer" }, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(500).toArray());
  const stats = await db.collection("orders").aggregate([{ $match: { userId: { $ne: null } } }, { $group: { _id: "$userId", n: { $sum: 1 }, sum: { $sum: "$total" } } }]).toArray();
  const byUser = new Map(stats.map((s) => [String(s._id), s]));
  const sel = users.find((x) => x._id === u);
  const history = sel ? plain<{ _id: string; reference: string; total: number; status: string; createdAt: string }[]>(await db.collection("orders").find({ userId: sel._id }).sort({ createdAt: -1 }).limit(50).toArray()) : [];
  return (
    <div>
      <h1 style={{ fontSize: "1.7rem" }}>Clients</h1>
      <p className="muted">La désactivation d&apos;un compte se fait dans « Utilisateurs & rôles » (administrateur).</p>
      <div className="detailgrid">
        <div className="scroll"><table className="tbl"><thead><tr><th>Client</th><th>Contact</th><th>Commandes</th><th>Inscrit le</th></tr></thead>
          <tbody>{users.length === 0 && <tr><td colSpan={4} className="muted">Aucun client inscrit.</td></tr>}
            {users.map((c) => <tr key={c._id} className={sel?._id === c._id ? "sel" : ""}>
              <td><a href={`/admin/clients?u=${c._id}`} style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", textDecoration: "none" }}><Avatar src={c.avatar} name={`${c.firstName} ${c.lastName}`} size={38} /><strong>{c.firstName} {c.lastName}</strong></a>{c.active === false && <span className="badge off" style={{ marginLeft: 6 }}>désactivé</span>}</td>
              <td>{c.phone}<br /><small className="muted">{c.email}</small></td><td>{byUser.get(c._id)?.n || 0} · {fcfa(byUser.get(c._id)?.sum || 0)}</td><td>{fdate(c.createdAt)}</td></tr>)}</tbody></table></div>
        {sel ? <div className="panel">
          <div style={{ display: "flex", gap: ".9rem", alignItems: "center" }}><Avatar src={sel.avatar} name={`${sel.firstName} ${sel.lastName}`} size={72} /><div><h3 style={{ margin: 0 }}>{sel.firstName} {sel.lastName}</h3><div className="muted" style={{ fontSize: ".9rem" }}>Client depuis le {fdate(sel.createdAt)}</div></div></div>
          <p style={{ marginBottom: 0 }}><strong>Téléphone :</strong> <a href={`tel:${sel.phone}`}>{sel.phone}</a><br /><strong>E-mail :</strong> {sel.email}<br /><strong>Adresse :</strong> {sel.address || "—"}{sel.city ? `, ${sel.city}` : ""}<br /><strong>Commandes :</strong> {byUser.get(sel._id)?.n || 0} · <strong>Total :</strong> {fcfa(byUser.get(sel._id)?.sum || 0)}</p>
          <h3 style={{ fontSize: "1rem", marginTop: "1rem" }}>Historique des commandes</h3>
          {history.length === 0 ? <p className="muted">Aucune commande.</p> : history.map((o) => <div className="total" key={o._id}><span>{o.reference} · {fdate(o.createdAt)} <StatusBadge kind="order" value={o.status} /></span><span>{fcfa(o.total)}</span></div>)}</div>
          : <div className="panel muted">Sélectionnez un client pour voir sa fiche.</div>}
      </div>
    </div>
  );
}
