"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useCart } from "./CartProvider";
import { fcfa } from "@/lib/pricing";

type Props = { deliveryFee: number; freeFrom: number; allowCod: boolean; allowUssd: boolean; defaults: { name: string; phone: string; address: string; city: string } };

export function CheckoutForm({ deliveryFee, freeFrom, allowCod, allowUssd, defaults }: Props) {
  const { lines, subtotal, clear, ready } = useCart();
  const [f, setF] = useState({ customerName: defaults.name, phone: defaults.phone, address: defaults.address, city: defaults.city, notes: "" });
  const [pay, setPay] = useState<"ussd" | "delivery">(allowUssd ? "ussd" : "delivery");
  const [operator, setOperator] = useState<"TMoney" | "Flooz">("TMoney");
  const [loc, setLoc] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  if (!ready) return <p className="muted">Chargement…</p>;
  if (!lines.length) return <div className="panel center"><p>Votre panier est vide.</p><Link href="/menu" className="btn btn-primary">Voir le menu</Link></div>;
  const fee = freeFrom > 0 && subtotal >= freeFrom ? 0 : deliveryFee;

  function share() {
    setGeoMsg("");
    if (!("geolocation" in navigator)) return setGeoMsg("La géolocalisation n'est pas disponible sur cet appareil. Saisissez votre adresse.");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }); setGeoMsg("Position enregistrée avec votre commande."); },
      () => setGeoMsg("Position non partagée. Pas de problème : saisissez simplement votre adresse."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, paymentMethod: pay, operator: pay === "ussd" ? operator : undefined, location: loc, items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })) }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(d.error || "Commande impossible."); setBusy(false); return; }
    clear();
    window.location.href = `/commande/${d.id}?t=${d.token}`;
  }
  return (
    <form className="cols2" onSubmit={submit}>
      <div className="panel">
        <h3>Vos informations</h3>
        {err && <div className="err" role="alert">{err}</div>}
        <label htmlFor="n">Nom et prénom</label><input id="n" value={f.customerName} onChange={set("customerName")} required minLength={2} maxLength={100} autoComplete="name" />
        <label htmlFor="p">Téléphone</label><input id="p" type="tel" value={f.phone} onChange={set("phone")} required autoComplete="tel" />
        <label htmlFor="a">Adresse de livraison</label><input id="a" value={f.address} onChange={set("address")} required minLength={4} maxLength={500} autoComplete="street-address" />
        <label htmlFor="c">Ville ou quartier</label><input id="c" value={f.city} onChange={set("city")} maxLength={100} />
        <label htmlFor="i">Informations complémentaires</label><textarea id="i" rows={2} value={f.notes} onChange={set("notes")} maxLength={500} />
        <div style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--brown)" }} onClick={share}><MapPin size={16} /> Partager ma position GPS (facultatif)</button>
          {geoMsg && <p className="muted" style={{ fontSize: ".85rem" }}>{geoMsg}</p>}
        </div>
        <h3 style={{ marginTop: "1.4rem" }}>Mode de paiement</h3>
        {allowUssd && <div className="check"><input id="u" type="radio" checked={pay === "ussd"} onChange={() => setPay("ussd")} /><label htmlFor="u">Mobile money (USSD)</label></div>}
        {allowUssd && pay === "ussd" && <div className="chips"><button type="button" className={`chip ${operator === "TMoney" ? "on" : ""}`} onClick={() => setOperator("TMoney")}>TMoney</button><button type="button" className={`chip ${operator === "Flooz" ? "on" : ""}`} onClick={() => setOperator("Flooz")}>Flooz</button></div>}
        {allowCod && <div className="check"><input id="d" type="radio" checked={pay === "delivery"} onChange={() => setPay("delivery")} /><label htmlFor="d">Paiement à la livraison</label></div>}
        {!allowUssd && !allowCod && <div className="err">Aucun mode de paiement n&apos;est activé pour le moment.</div>}
      </div>
      <div className="panel">
        <h3>Votre commande</h3>
        {lines.map((l) => <div className="total" key={l.productId}><span>{l.quantity} × {l.name}</span><span>{fcfa(l.quantity * l.price)}</span></div>)}
        <div className="total"><span>Livraison</span><span>{fee ? fcfa(fee) : "—"}</span></div>
        <div className="total big"><span>Total</span><span>{fcfa(subtotal + fee)}</span></div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: ".8rem" }} disabled={busy || (!allowUssd && !allowCod)}>{busy ? "Envoi…" : "Confirmer la commande"}</button>
        <p className="muted" style={{ fontSize: ".8rem" }}>En commandant, vous acceptez nos <Link href="/conditions">conditions générales</Link>.</p>
      </div>
    </form>
  );
}
