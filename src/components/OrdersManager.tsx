"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fcfa, fdate } from "@/lib/pricing";
import { DELIVERY_STATUS, ORDER_STATUS, PAYMENT_STATUS, SECTION_LABEL } from "@/lib/labels";
import { DELIVERY_TONE, ORDER_TONE, PAYMENT_TONE, TONE_COLOR } from "@/lib/labels";
import { StatusBadge } from "./StatusBadge";
import { OrderBlocks } from "./OrderBlocks";
import type { Order } from "@/lib/types";

type Mode = "orders" | "deliveries" | "payments";

export function OrdersManager({ orders, mode, canDelete = false }: { orders: Order[]; mode: Mode; canDelete?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(""); const [date, setDate] = useState(""); const [status, setStatus] = useState(""); const [type, setType] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [note, setNote] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);

  const list = orders.filter((o) => {
    if (mode === "deliveries" && (["delivered", "cancelled"].includes(o.status) || o.deliveryStatus === "delivered")) return false;
    if (mode === "payments" && !["ussd", "delivery"].includes(o.paymentMethod)) return false;
    const hay = `${o.reference} ${o.customerName} ${o.phone}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (date && !o.createdAt.startsWith(date)) return false;
    if (type && o.section !== type) return false;
    if (status) { const k = mode === "payments" ? o.paymentStatus : mode === "deliveries" ? (o.deliveryStatus || "to_prepare") : o.status; if (k !== status) return false; }
    return true;
  });
  const current = orders.find((o) => o._id === sel) || null;
  const statusOpts = mode === "payments" ? PAYMENT_STATUS : mode === "deliveries" ? DELIVERY_STATUS : ORDER_STATUS;

  function pick(o: Order) { setSel(o._id); setVals({}); setNote(""); setMsg(""); }
  async function save(extra?: Record<string, string>) {
    if (!current) return;
    setBusy(true); setMsg("");
    const body = { ...vals, ...extra, note: note || undefined };
    const r = await fetch(`/api/admin/orders/${current._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMsg(d.error || "Mise à jour impossible.");
    setMsg("Mise à jour enregistrée."); setVals({}); setNote(""); router.refresh();
  }

  async function del() {
    if (!current || !confirm(`Supprimer définitivement la commande ${current.reference} ?`)) return;
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/orders/${current._id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMsg(d.error || "Suppression impossible.");
    setSel(null); router.refresh();
  }
  const loc = current?.location;
  const sels: [string, string, Record<string, string>, string][] = [
    ["status", "Statut de la commande", ORDER_STATUS, current?.status || ""],
    ["paymentStatus", "Statut du paiement", Object.fromEntries(Object.entries(PAYMENT_STATUS).filter(([k]) => k !== "unpaid")), current?.paymentStatus === "unpaid" ? "pending" : current?.paymentStatus || ""],
    ["deliveryStatus", "Statut de livraison", DELIVERY_STATUS, current?.deliveryStatus || "to_prepare"],
  ];
  const shown = mode === "payments" ? [sels[1]] : mode === "deliveries" ? [sels[2], sels[0]] : sels;

  return (
    <div>
      <h1 style={{ fontSize: "1.7rem" }}>{mode === "orders" ? "Commandes" : mode === "deliveries" ? "Livraisons" : "Paiements"}</h1>
      <div className="toolbar">
        <input placeholder="Rechercher (n°, client, téléphone)" value={q} onChange={(e) => setQ(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Statut"><option value="">Tous les statuts</option>{Object.entries(statusOpts).map(([k, v]) => k !== "unpaid" && <option key={k} value={k}>{v}</option>)}</select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option value="">Tous les types</option>{Object.entries(SECTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
            <div className="detailgrid">
        <div className="scroll"><table className="tbl"><thead><tr><th>N°</th><th>Client</th><th>Total</th><th>{mode === "payments" ? "Paiement" : mode === "deliveries" ? "Livraison" : "Statut"}</th><th>Date</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={5} className="muted">Aucune commande.</td></tr>}
            {list.map((o) => (
              <tr key={o._id} className={sel === o._id ? "sel" : ""} style={{ cursor: "pointer" }} onClick={() => pick(o)}>
                <td style={{ borderLeft: `6px solid ${TONE_COLOR[(mode === "payments" ? PAYMENT_TONE[o.paymentStatus] : mode === "deliveries" ? DELIVERY_TONE[o.deliveryStatus || "to_prepare"] : ORDER_TONE[o.status]) || "gray"]}` }}><strong>{o.reference}</strong><br /><small className="muted">{SECTION_LABEL[o.section] || o.section}</small><div className="mini">{o.items.slice(0, 3).map((i, k) => i.image ? <img key={k} src={i.image} alt="" /> : null)}</div></td>
                <td>{o.customerName}<br /><small className="muted">{o.phone}</small></td><td>{fcfa(o.total)}</td>
                <td>{mode === "payments" ? <StatusBadge kind="payment" value={o.paymentStatus} /> : mode === "deliveries" ? <><StatusBadge kind="delivery" value={o.deliveryStatus} /><StatusBadge kind="order" value={o.status} /></> : <><StatusBadge kind="order" value={o.status} /><StatusBadge kind="payment" value={o.paymentStatus} /></>}</td>
                <td>{fdate(o.createdAt)}</td>

              </tr>))}
          </tbody></table></div>
        {current ? (
          <div className="panel">
            <OrderBlocks order={current} badges={<div><StatusBadge kind="order" value={current.status} /><StatusBadge kind="payment" value={current.paymentStatus} /><StatusBadge kind="delivery" value={current.deliveryStatus} /></div>} />
            {loc && (mode !== "orders") && <>
              <iframe className="map" title="Carte" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${loc.longitude - 0.01}%2C${loc.latitude - 0.01}%2C${loc.longitude + 0.01}%2C${loc.latitude + 0.01}&layer=mapnik&marker=${loc.latitude}%2C${loc.longitude}`} />
              <p><a className="btn btn-leaf btn-sm" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}>Itinéraire</a>{" "}
                <a className="btn btn-light btn-sm" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${loc.latitude}&mlon=${loc.longitude}#map=17/${loc.latitude}/${loc.longitude}`}>Voir sur OpenStreetMap</a></p></>}
            {loc && mode === "orders" && <p>📍 GPS : {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)} — <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}>carte</a></p>}
            {!loc && mode === "deliveries" && <p className="muted">Pas de position GPS : utiliser l&apos;adresse saisie.</p>}
            {msg && <div className={msg.startsWith("Mise") ? "okmsg" : "err"}>{msg}</div>}
            {shown.map(([k, label, opts, cur]) => (
              <div key={k}><label>{label}</label>
                <select value={vals[k] ?? cur} onChange={(e) => setVals({ ...vals, [k]: e.target.value })}>{Object.entries(opts).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>))}
            <label>Note (historique)</label><input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".8rem" }}>
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => save()}>Enregistrer</button>
              {mode === "orders" && canDelete && <button className="btn btn-danger btn-sm" disabled={busy} onClick={del}>Supprimer la commande</button>}
              {mode === "payments" && current.paymentMethod === "ussd" && <>
                <button className="btn btn-leaf btn-sm" disabled={busy} onClick={() => save({ paymentStatus: "paid" })}>Confirmer le paiement</button>
                <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => save({ paymentStatus: "failed" })}>Refuser</button></>}
            </div>
            {(current.history?.length ?? 0) > 0 && <><h3 style={{ marginTop: "1.2rem", fontSize: "1rem" }}>Historique</h3>
              {[...(current.history || [])].reverse().map((h, i) => <div key={i} className="muted" style={{ fontSize: ".8rem" }}>{fdate(h.at)} · {h.by} · {h.field === "note" ? `note : ${h.to}` : `${h.field} → ${(PAYMENT_STATUS[h.to] || ORDER_STATUS[h.to] || DELIVERY_STATUS[h.to] || h.to)}`}{h.note && h.field !== "note" ? ` (${h.note})` : ""}</div>)}</>}
          </div>
        ) : <div className="panel muted">Sélectionnez une commande pour voir le détail.</div>}
      </div>
    </div>
  );
}