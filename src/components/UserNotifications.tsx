"use client";
import { useRouter } from "next/navigation";
import { fdate } from "@/lib/pricing";
import { PushButton } from "./PushButton";

type N = { _id: string; title: string; message: string; createdAt: string; read?: boolean };
export function UserNotifications({ items }: { items: N[] }) {
  const router = useRouter();
  const unread = items.filter((n) => !n.read).length;
  async function readAll() { await fetch("/api/account/notifications", { method: "PATCH" }); router.refresh(); }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Notifications{unread > 0 ? ` (${unread})` : ""}</h2>
        {unread > 0 && <button className="btn btn-light btn-sm" onClick={readAll}>Tout marquer comme lu</button>}
      </div>
      <PushButton />
      {items.length === 0 ? <div className="panel muted">Aucune notification.</div> : items.map((n) => (
        <div key={n._id} className={`panel ${n.read ? "" : "unread"}`} style={{ marginBottom: ".6rem", padding: ".8rem 1rem" }}>
          <strong>{n.title}</strong><div className="muted" style={{ fontSize: ".9rem" }}>{n.message} · {fdate(n.createdAt)}</div>
        </div>))}
    </div>
  );
}
