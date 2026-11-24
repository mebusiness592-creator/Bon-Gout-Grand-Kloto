"use client";
import { useState } from "react";
import { Copy, Phone } from "lucide-react";
import { fcfa } from "@/lib/pricing";

type Op = "TMoney" | "Flooz";
export function UssdPay({ id, token, codes, operator, instructions, status, reference, amount }: { id: string; token: string; codes: Record<Op, string | null>; operator: string; instructions: string; status: string; reference: string; amount: number }) {
  const [st, setSt] = useState(status);
  const [op, setOp] = useState<Op>(operator === "Flooz" ? "Flooz" : "TMoney");
  const [err, setErr] = useState(""); const [copied, setCopied] = useState(false);
  const code = codes[op];
  async function declare() {
    setErr("");
    const r = await fetch(`/api/orders/${id}/declare`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, operator: op }) });
    if (r.ok) setSt("awaiting_verification"); else setErr((await r.json().catch(() => ({}))).error || "Action impossible.");
  }
  async function copy() { try { await navigator.clipboard.writeText(code || ""); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignoré */ } }
  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h3>Paiement mobile money</h3>
      <p>{instructions}</p>
      <p>Montant à payer : <strong>{fcfa(amount)}</strong> <span className="muted">(calculé automatiquement, livraison comprise)</span><br />Numéro de commande : <strong>{reference}</strong></p>
      {st === "pending" && <>
        <label>1. Choisissez votre opérateur</label>
        <div className="chips" style={{ margin: ".3rem 0 1rem" }}>{(["TMoney", "Flooz"] as Op[]).map((o) => <button key={o} type="button" className={`chip ${op === o ? "on" : ""}`} onClick={() => setOp(o)}>{o}</button>)}</div>
        <label>2. Ouvrez le composeur de votre téléphone</label>
        {code ? (
          <>
            <p style={{ margin: ".3rem 0" }}>Code prérempli : <strong style={{ fontSize: "1.2rem" }}>{code}</strong></p>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              <a className="btn btn-gold" href={`tel:${code.replace(/#/g, "%23")}`}><Phone size={16} /> Ouvrir le composeur avec le code</a>
              <button type="button" className="btn btn-light" onClick={copy}><Copy size={16} /> {copied ? "Copié !" : "Copier le code"}</button>
            </div>
            <p className="muted" style={{ fontSize: ".8rem" }}>Il ne reste qu&apos;à valider avec votre code secret sur votre téléphone. Sur ordinateur, ou si le code n&apos;est pas prérempli, composez-le manuellement.</p>
          </>
        ) : <div className="err">Le code {op} n&apos;est pas encore configuré. Choisissez l&apos;autre opérateur ou contactez le restaurant.</div>}
        {err && <div className="err">{err}</div>}
        <label style={{ marginTop: "1rem" }}>3. Une fois le paiement validé sur votre téléphone</label>
        <button className="btn btn-primary" style={{ marginTop: ".3rem" }} onClick={declare}>✅ Confirmer que j&apos;ai payé</button>
      </>}
      {st !== "pending" && <div className="okmsg">Merci ! Votre paiement est <strong>en attente de vérification</strong> : il sera validé après contrôle par notre équipe.</div>}
    </div>
  );
}
