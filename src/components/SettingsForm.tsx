"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/settings";

const text: [keyof Settings, string][] = [
  ["name", "Nom du restaurant"], ["tagline", "Slogan"], ["phone", "Téléphone"], ["whatsapp", "WhatsApp (avec indicatif)"], ["email", "E-mail de contact"],
  ["address", "Adresse"], ["hours", "Horaires d'ouverture"],
  ["facebook", "Lien Facebook"], ["instagram", "Lien Instagram"], ["tiktok", "Lien TikTok"],
  ["youtube", "Lien de la chaîne YouTube"], ["telegram", "Lien Telegram"], ["x", "Lien X (Twitter)"], ["linkedin", "Lien LinkedIn"],
];
export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(""); setErr("");
    const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...s, deliveryFee: Number(s.deliveryFee) || 0, freeDeliveryFrom: Number(s.freeDeliveryFrom) || 0 }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setMsg("Paramètres enregistrés."); router.refresh(); } else setErr(d.error || "Enregistrement impossible.");
  }
  return (
    <form className="panel" onSubmit={save} style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: "1.7rem" }}>Paramètres</h1>
      {msg && <div className="okmsg">{msg}</div>}{err && <div className="err">{err}</div>}
      <h3 style={{ marginTop: "1.4rem" }}>Informations et réseaux sociaux</h3><div className="row2">{text.map(([k, l]) => <div key={k}><label>{l}</label><input value={String(s[k])} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></div>)}</div>
      <h3 style={{ marginTop: "1.4rem" }}>Livraison</h3>
      <div className="row2"><div><label>Frais de livraison (FCFA)</label><input type="number" min={0} value={s.deliveryFee} onChange={(e) => setS({ ...s, deliveryFee: Number(e.target.value) })} /></div>
        <div><label>Livraison offerte dès (FCFA, 0 = jamais)</label><input type="number" min={0} value={s.freeDeliveryFrom} onChange={(e) => setS({ ...s, freeDeliveryFrom: Number(e.target.value) })} /></div></div>
      <label>Message sur la livraison</label><input value={s.deliveryNote} onChange={(e) => setS({ ...s, deliveryNote: e.target.value })} />
      <h3 style={{ marginTop: "1.4rem" }}>Paiement</h3>
      <div className="check"><input id="cod" type="checkbox" checked={s.allowCod} onChange={(e) => setS({ ...s, allowCod: e.target.checked })} /><label htmlFor="cod">Autoriser le paiement à la livraison</label></div>
      <div className="check"><input id="ussd" type="checkbox" checked={s.allowUssd} onChange={(e) => setS({ ...s, allowUssd: e.target.checked })} /><label htmlFor="ussd">Autoriser le paiement mobile (USSD)</label></div>
      <label>Instructions affichées au client (paiement mobile)</label><textarea rows={3} value={s.paymentInstructions} onChange={(e) => setS({ ...s, paymentInstructions: e.target.value })} />
      <p className="muted" style={{ fontSize: ".82rem" }}>Les codes USSD TMoney / Flooz se configurent dans les variables d&apos;environnement (jamais ici).</p>
      <div className="check" style={{ marginTop: ".8rem" }}><input id="nn" type="checkbox" checked={s.notifyNewOrders} onChange={(e) => setS({ ...s, notifyNewOrders: e.target.checked })} /><label htmlFor="nn">Notifications de nouvelles commandes</label></div>
      <button className="btn btn-primary" style={{ marginTop: "1.2rem" }} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
    </form>
  );
}
