"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, Trash2, X } from "lucide-react";
import { fdate } from "@/lib/pricing";
import { PushButton } from "./PushButton";

export type Notif = { _id: string; title: string; message: string; createdAt: string; read?: boolean; image?: string | null };
const H = { "Content-Type": "application/json" };

/** Liste des notifications du client avec suppression (message par message ou tout l'historique). */
export function NotifPanel({ items }: { items: Notif[] }) {
  const router = useRouter();
  const [list, setList] = useState(items);
  useEffect(() => setList(items), [items]);
  async function del(id: string) { setList((l) => l.filter((n) => n._id !== id)); await fetch("/api/account/notifications", { method: "DELETE", headers: H, body: JSON.stringify({ id }) }); router.refresh(); }
  async function clear() { setList([]); await fetch("/api/account/notifications", { method: "DELETE", headers: H, body: JSON.stringify({ all: true }) }); router.refresh(); }
  return (
    <div>
      <PushButton />
      {list.length === 0 ? <p className="muted">Aucune notification.</p> : <>
        {list.map((n) => (
          <div key={n._id} className={`nrow ${n.read ? "" : "unread"}`} style={{ paddingLeft: n.read ? 0 : ".6rem" }}>
            {n.image && <img className="nimg" src={n.image} alt="" loading="lazy" />}<div style={{ flex: 1 }}><strong>{n.title}</strong><div className="muted" style={{ fontSize: ".9rem" }}>{n.message}</div><small className="muted">{fdate(n.createdAt)}</small></div>
            <button className="xbtn" aria-label="Supprimer ce message" onClick={() => del(n._id)}><Trash2 size={17} /></button>
          </div>))}
        <p style={{ marginTop: ".8rem" }}><button className="btn btn-danger btn-sm" onClick={clear}>Tout supprimer</button></p>
      </>}
      <p className="muted" style={{ fontSize: ".78rem" }}>Les notifications sont supprimées automatiquement après 5 jours.</p>
    </div>
  );
}

export function NotificationBell({ items, unread }: { items: Notif[]; unread: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  async function show() {
    setOpen(true);
    if (unread > 0) { await fetch("/api/account/notifications", { method: "PATCH" }); router.refresh(); }
  }
  return (
    <>
      <button className="iconbtn" aria-label="Notifications" onClick={show}><Bell size={20} />{unread > 0 && <span className="count">{unread}</span>}</button>
      {mounted && open && createPortal(
        <div className="modal notification-modal" role="dialog" aria-modal="true" aria-label="Notifications" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Notifications</h2>
              <button className="xbtn" aria-label="Fermer" onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <NotifPanel items={items.map((n) => ({ ...n, read: true }))} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
