"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Lock, LogOut, Package, ShieldCheck, Trash2, User } from "lucide-react";
import { Avatar } from "./Avatar";
import { ImageUploader } from "./ImageUploader";
import { PasswordInput } from "./PasswordInput";
import { StatusBadge } from "./StatusBadge";
import { NotifPanel, type Notif } from "./NotificationBell";
import { fcfa, fdate } from "@/lib/pricing";
import { ROLE_LABEL } from "@/lib/labels";
import type { Order } from "@/lib/types";

type U = { firstName: string; lastName: string; email: string; phone: string; address: string; city: string; avatar: string; role: string };
type Tab = "orders" | "profile" | "security" | "notifications";
const H = { "Content-Type": "application/json" };

export function AccountDashboard({ user, orders, notes, unread }: { user: U; orders: Order[]; notes: Notif[]; unread: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [f, setF] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, address: user.address, city: user.city });
  const [avatar, setAvatar] = useState(user.avatar);
  const [cur, setCur] = useState(""); const [nw, setNw] = useState("");
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const full = `${user.firstName} ${user.lastName}`;

  async function patch(body: Record<string, unknown>, ok: string) {
    setMsg(""); setErr("");
    const r = await fetch("/api/account", { method: "PATCH", headers: H, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setMsg(ok); router.refresh(); return true; }
    setErr(d.error || "Enregistrement impossible."); return false;
  }
  async function hide(o: Order) {
    if (!confirm("Supprimer cette commande de votre historique ?")) return;
    const r = await fetch(`/api/account/orders/${o._id}`, { method: "DELETE" });
    if (r.ok) router.refresh(); else alert((await r.json().catch(() => ({}))).error || "Suppression impossible.");
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }
  const tabs: [Tab, string, React.ReactNode][] = [
    ["orders", "Mes commandes", <Package key="o" size={18} />], ["profile", "Mon profil", <User key="p" size={18} />],
    ["security", "Mot de passe", <Lock key="s" size={18} />], ["notifications", unread ? `Notifications (${unread})` : "Notifications", <Bell key="n" size={18} />],
  ];
  return (
    <div className="acc">
      <div>
        <div className="acc-head"><Avatar src={avatar} name={full} size={64} /><div style={{ minWidth: 0 }}><strong style={{ fontSize: "1.1rem" }}>{full}</strong><div className="muted" style={{ fontSize: ".85rem", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div><span className="pill">{ROLE_LABEL[user.role] || user.role}</span></div></div>
        <div className="acc-menu" style={{ marginTop: ".8rem" }}>
          {tabs.map(([k, l, i]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setMsg(""); setErr(""); }}>{i}{l}</button>)}
          {user.role !== "customer" && <Link href="/admin" className="btn btn-gold" style={{ justifyContent: "flex-start" }}><ShieldCheck size={18} /> Administration</Link>}
          <button onClick={logout}><LogOut size={18} /> Déconnexion</button>
        </div>
      </div>
      <div>
        {msg && <div className="okmsg">{msg}</div>}{err && <div className="err">{err}</div>}
        {tab === "orders" && (
          <div>
            <h2 style={{ fontSize: "1.4rem" }}>Mes commandes</h2>
            {orders.length === 0 ? <div className="panel muted">Aucune commande pour le moment. <Link href="/menu">Voir le menu</Link></div> : orders.map((o) => (
              <div key={o._id} className="panel" style={{ marginBottom: ".8rem" }}>
                <Link href={`/commande/${o._id}`} style={{ textDecoration: "none" }}>
                  <div className="total"><strong>{o.reference}</strong><strong>{fcfa(o.total)}</strong></div>
                  <div className="muted" style={{ fontSize: ".85rem" }}>{fdate(o.createdAt)}</div>
                  <div className="mini">{o.items.slice(0, 5).map((i, k) => i.image ? <img key={k} src={i.image} alt={i.name} title={i.name} /> : null)}</div>
                  <p style={{ margin: ".4rem 0 0" }}><StatusBadge kind="order" value={o.status} /><StatusBadge kind="payment" value={o.paymentStatus} /><StatusBadge kind="delivery" value={o.deliveryStatus} /></p>
                </Link>
                <div style={{ marginTop: ".5rem", display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <Link href={`/commande/${o._id}`} className="btn btn-light btn-sm">Voir le détail</Link>
                  {["delivered", "cancelled"].includes(o.status)
                    ? <button className="btn btn-danger btn-sm" onClick={() => hide(o)}><Trash2 size={14} /> Supprimer</button>
                    : <small className="muted">Suppression possible une fois la commande livrée ou annulée.</small>}
                </div>
              </div>))}
          </div>)}
        {tab === "profile" && (
          <div className="panel">
            <h2 style={{ fontSize: "1.4rem" }}>Mon profil</h2>
            <label>Photo de profil</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <Avatar src={avatar} name={full} size={72} />
              <ImageUploader max={1} signUrl="/api/account/avatar-sign" value={avatar ? [avatar] : []} onChange={(v) => { const u = v[0] || ""; setAvatar(u); patch({ avatar: u }, u ? "Photo enregistrée." : "Photo supprimée."); }} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); patch(f, "Informations enregistrées."); }}>
              <div className="row2"><div><label>Nom</label><input value={f.lastName} onChange={set("lastName")} required /></div><div><label>Prénom</label><input value={f.firstName} onChange={set("firstName")} required /></div></div>
              <label>Téléphone</label><input value={f.phone} onChange={set("phone")} required />
              <label>Adresse</label><input value={f.address} onChange={set("address")} />
              <label>Ville / quartier</label><input value={f.city} onChange={set("city")} />
              <button className="btn btn-primary" style={{ marginTop: "1rem" }}>Enregistrer</button>
            </form>
          </div>)}
        {tab === "security" && (
          <form className="panel" onSubmit={async (e) => { e.preventDefault(); if (await patch({ currentPassword: cur, newPassword: nw }, "Mot de passe modifié.")) { setCur(""); setNw(""); } }}>
            <h2 style={{ fontSize: "1.4rem" }}>Changer mon mot de passe</h2>
            <PasswordInput name="cur" label="Mot de passe actuel" value={cur} onChange={setCur} autoComplete="current-password" />
            <PasswordInput name="nw" label="Nouveau mot de passe (8 caractères minimum)" value={nw} onChange={setNw} autoComplete="new-password" />
            <button className="btn btn-primary" style={{ marginTop: "1rem" }}>Modifier</button>
          </form>)}
        {tab === "notifications" && <div className="panel"><h2 style={{ fontSize: "1.4rem" }}>Notifications</h2><NotifPanel items={notes} /></div>}
      </div>
    </div>
  );
}
