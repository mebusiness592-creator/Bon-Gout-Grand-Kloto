"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fdate } from "@/lib/pricing";
import { PushButton } from "./PushButton";

type N = { _id: string; title: string; message: string; read: boolean; createdAt: string; orderId?: string | null; type?: string };
export function NotificationsAdmin({ items }: { items: N[] }) {
  const router = useRouter();
  async function mark(body: Record<string, unknown>) {
    await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
        <h1 style={{ fontSize: "1.7rem", margin: 0 }}>Notifications</h1>
        <button className="btn btn-light btn-sm" onClick={() => mark({ all: true })}>Tout marquer comme lu</button>
      </div>
      <PushButton />
      <div style={{ marginTop: "1rem", display: "grid", gap: ".6rem" }}>
        {items.length === 0 && <div className="panel muted">Aucune notification.</div>}
        {items.map((n) => (
          <div key={n._id} className="panel" style={{ borderLeft: `4px solid ${n.read ? "var(--line)" : "var(--flame)"}`, padding: ".9rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".6rem", flexWrap: "wrap" }}><strong>{n.title}</strong><small className="muted">{fdate(n.createdAt)}</small></div>
            <div>{n.message}</div>
            <div style={{ marginTop: ".4rem", display: "flex", gap: ".5rem" }}>
              {n.type === "payment" ? <Link className="btn btn-sm btn-light" href="/admin/paiements">Vérifier</Link> : n.orderId ? <Link className="btn btn-sm btn-light" href="/admin/commandes">Commandes</Link> : null}
              {!n.read && <button className="btn btn-sm btn-light" onClick={() => mark({ id: n._id })}>Marquer comme lu</button>}</div>
          </div>))}
      </div>
    </div>
  );
}
