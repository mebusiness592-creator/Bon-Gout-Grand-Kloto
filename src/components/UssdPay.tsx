"use client";
import { useState } from "react";
import { Phone } from "lucide-react";

export function UssdPay({ id, token, code, instructions, status }: { id: string; token: string; code: string | null; instructions: string; status: string }) {
  const [st, setSt] = useState(status);
  const [err, setErr] = useState("");
  async function declare() {
    setErr("");
    const r = await fetch(`/api/orders/${id}/declare`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (r.ok) setSt("awaiting_verification"); else setErr((await r.json().catch(() => ({}))).error || "Action impossible.");
  }
  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h3>Paiement mobile</h3>
      <p>{instructions}</p>
      {code ? (
        <>
          <p>Code à composer : <strong style={{ fontSize: "1.2rem" }}>{code}</strong></p>
          <a className="btn btn-gold" href={`tel:${code.replace(/#/g, "%23")}`}><Phone size={16} /> Ouvrir le composeur</a>
          <p className="muted" style={{ fontSize: ".8rem" }}>Sur ordinateur, ou si votre téléphone ne préremplit pas le code, composez-le manuellement.</p>
        </>
      ) : <div className="err">Le code USSD n&apos;est pas encore configuré. Contactez le restaurant pour finaliser le paiement.</div>}
      {err && <div className="err">{err}</div>}
      {st === "pending"
        ? <button className="btn btn-primary" onClick={declare}>J&apos;ai lancé le paiement</button>
        : <div className="okmsg">Merci ! Votre paiement est <strong>en attente de vérification</strong> : il sera validé après contrôle par notre équipe.</div>}
    </div>
  );
}
