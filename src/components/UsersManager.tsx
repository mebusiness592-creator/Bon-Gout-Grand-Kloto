"use client";
import { useRouter } from "next/navigation";
import { ROLE_LABEL } from "@/lib/labels";
import { fdate } from "@/lib/pricing";
import { Avatar } from "./Avatar";

type U = { avatar?: string; _id: string; firstName: string; lastName: string; email: string; phone: string; role: string; active?: boolean; createdAt?: string };
export function UsersManager({ users, meId }: { users: U[]; meId: string }) {
  const router = useRouter();
  async function patch(id: string, body: Record<string, unknown>) {
    const r = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) alert((await r.json().catch(() => ({}))).error || "Action impossible.");
    router.refresh();
  }
  function resetPw(u: U) {
    const pw = prompt(`Nouveau mot de passe temporaire pour ${u.email} (8 caractères minimum) :`);
    if (pw) patch(u._id, { newPassword: pw });
  }
  return (
    <div>
      <h1 style={{ fontSize: "1.7rem" }}>Utilisateurs et rôles</h1>
      <p className="muted">Les rôles sont enregistrés en base et relus à chaque requête. Un utilisateur ne peut pas modifier son propre rôle.</p>
      <div className="scroll"><table className="tbl"><thead><tr><th>Nom</th><th>Contact</th><th>Rôle</th><th>Statut</th><th>Inscrit le</th><th /></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u._id}><td><span style={{ display: "inline-flex", alignItems: "center", gap: ".5rem" }}><Avatar src={u.avatar} name={`${u.firstName} ${u.lastName}`} size={36} />{u.firstName} {u.lastName}</span></td><td>{u.email}<br /><small className="muted">{u.phone}</small></td>
            <td><select value={u.role} disabled={u._id === meId} onChange={(e) => patch(u._id, { role: e.target.value })}>{Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
            <td><span className={`badge ${u.active === false ? "off" : "ok"}`}>{u.active === false ? "Désactivé" : "Actif"}</span></td>
            <td>{fdate(u.createdAt)}</td>
            <td style={{ whiteSpace: "nowrap" }}>{u._id !== meId && <button className="btn btn-sm btn-light" onClick={() => patch(u._id, { active: u.active === false })}>{u.active === false ? "Réactiver" : "Désactiver"}</button>}{" "}
              <button className="btn btn-sm btn-light" onClick={() => resetPw(u)}>Mot de passe</button></td></tr>))}</tbody></table></div>
    </div>
  );
}
