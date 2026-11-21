import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { fcfa, fdate } from "@/lib/pricing";
export const metadata = { title: "Clients" };

export default async function Page({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  await requireStaff();
  const { u } = await searchParams;
  const db = await getDb();
  const users = plain<{ _id: string; firstName: string; lastName: string; email: string; phone: string; active?: boolean; createdAt?: string; address?: string }[]>(
    await db.collection("users").find({ role: "customer" }, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(500).toArray());
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
            {users.map((c) => <tr key={c._id} className={sel?._id === c._id ? "sel" : ""}><td><a href={`/admin/clients?u=${c._id}`}>{c.firstName} {c.lastName}</a>{c.active === false && <span className="badge off" style={{ marginLeft: 6 }}>désactivé</span>}</td>
              <td>{c.phone}<br /><small className="muted">{c.email}</small></td><td>{byUser.get(c._id)?.n || 0} · {fcfa(byUser.get(c._id)?.sum || 0)}</td><td>{fdate(c.createdAt)}</td></tr>)}</tbody></table></div>
        {sel ? <div className="panel"><h3>{sel.firstName} {sel.lastName}</h3><p className="muted">{sel.email} · {sel.phone}{sel.address ? ` · ${sel.address}` : ""}</p><h3 style={{ fontSize: "1rem" }}>Historique des commandes</h3>
          {history.length === 0 ? <p className="muted">Aucune commande.</p> : history.map((o) => <div className="total" key={o._id}><span>{o.reference} · {fdate(o.createdAt)}</span><span>{fcfa(o.total)}</span></div>)}</div>
          : <div className="panel muted">Sélectionnez un client pour voir son historique.</div>}
      </div>
    </div>
  );
}
