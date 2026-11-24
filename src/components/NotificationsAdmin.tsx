"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { fdate } from "@/lib/pricing";
import { PushButton } from "./PushButton";

type N = { _id: string; title: string; message: string; read: boolean; createdAt: string; orderId?: string | null; type?: string; image?: string | null };
const H = { "Content-Type": "application/json" };
export function NotificationsAdmin({ items }: { items: N[] }) {
  const router = useRouter();
  async function call(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    await fetch("/api/admin/notifications", { method, headers: H, body: JSON.stringify(body) });
    router.refresh();
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
        <h1 style={{ fontSize: "1.7rem", margin: 0 }}>Notifications</h1>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn btn-light btn-sm" onClick={() => call("PATCH", { all: true })}>Tout marquer comme lu</button>
          {items.length > 0 && <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("Supprimer toutes les notifications ?")) call("DELETE", { all: true }); }}>Tout supprimer</button>}
        </div>
      </div>
      <PushButton />
      <p className="muted" style={{ fontSize: ".8rem" }}>Les notifications sont supprimées automatiquement après 5 jours.</p>
      <div style={{ marginTop: ".6rem", display: "grid", gap: ".6rem" }}>
        {items.length === 0 && <div className="panel muted">Aucune notification.</div>}
        {items.map((n) => (
          <div key={n._id} className="panel" style={{ borderLeft: `4px solid ${n.read ? "var(--line)" : "var(--flame)"}`, padding: ".9rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".6rem", flexWrap: "wrap" }}><strong>{n.title}</strong><small className="muted">{fdate(n.createdAt)}</small></div>
            <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>{n.image && <img className="nimg" src={n.image} alt="" loading="lazy" />}<span>{n.message}</span></div>
            <div style={{ marginTop: ".4rem", display: "flex", gap: ".5rem", alignItems: "center" }}>
              {n.type === "payment" ? <Link className="btn btn-sm btn-light" href="/admin/paiements">Vérifier</Link> : n.orderId ? <Link className="btn btn-sm btn-light" href="/admin/commandes">Commandes</Link> : null}
              {!n.read && <button className="btn btn-sm btn-light" onClick={() => call("PATCH", { id: n._id })}>Marquer comme lu</button>}
              <button className="btn btn-sm btn-danger" aria-label="Supprimer" onClick={() => call("DELETE", { id: n._id })}><Trash2 size={14} /></button></div>
          </div>))}
      </div>
    </div>
  );
}
