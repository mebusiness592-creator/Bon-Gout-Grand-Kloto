"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { fcfa } from "@/lib/pricing";

type Props = { deliveryFee: number; freeFrom: number; allowCod: boolean; allowUssd: boolean; defaults: { name: string; phone: string; address: string; city: string } };
type Geo = "idle" | "loading" | "ok" | "denied" | "error";

export function CheckoutForm({ deliveryFee, freeFrom, allowCod, allowUssd, defaults }: Props) {
  const { lines, subtotal, clear, ready } = useCart();
  const [f, setF] = useState({ customerName: defaults.name, phone: defaults.phone, address: defaults.address, city: defaults.city, notes: "" });
  const [pay, setPay] = useState<"ussd" | "delivery">(allowUssd ? "ussd" : "delivery");
  const [operator, setOperator] = useState<"TMoney" | "Flooz">("TMoney");
  const [loc, setLoc] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [geo, setGeo] = useState<Geo>("idle"); const [geoMsg, setGeoMsg] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const auto = useRef(false); // vrai tant que l'adresse a été remplie automatiquement (et pas modifiée à la main)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (k === "address" || k === "city") auto.current = false;
    setF((p) => ({ ...p, [k]: e.target.value }));
  };

  if (!ready) return <p className="muted">Chargement…</p>;
  if (!lines.length) return <div className="panel center"><p>Votre panier est vide.</p><Link href="/menu" className="btn btn-primary">Voir le menu</Link></div>;
  const fee = freeFrom > 0 && subtotal >= freeFrom ? 0 : deliveryFee;

  function share() {
    setGeoMsg("");
    if (!("geolocation" in navigator)) { setGeo("error"); setGeoMsg("Votre téléphone ne permet pas de trouver votre position. Écrivez simplement votre adresse ci-dessous."); return; }
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLoc({ latitude, longitude, accuracy });
        let text = ""; let quartier = "";
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=fr&lat=${latitude}&lon=${longitude}`);
          const d = await r.json();
          const a = d.address || {};
          const road = [a.house_number, a.road].filter(Boolean).join(" ");
          quartier = a.suburb || a.neighbourhood || a.quarter || a.city_district || a.village || "";
          const ville = a.city || a.town || a.municipality || a.county || "";
          text = [road, quartier, ville].filter(Boolean).join(", ");
          if (!text && d.display_name) text = String(d.display_name).split(",").slice(0, 3).join(",").trim();
        } catch { /* adresse non trouvée : on garde seulement les coordonnées */ }
        setGeo("ok");
        if (text) {
          setF((p) => {
            const canFill = !p.address || auto.current;
            if (canFill) auto.current = true;
            return canFill ? { ...p, address: text, city: quartier || p.city } : p;
          });
          setGeoMsg("C'est fait ! Votre position est enregistrée et l'adresse a été remplie. Vérifiez-la et corrigez-la si besoin.");
        } else setGeoMsg("Votre position est enregistrée. Complétez simplement votre adresse (quartier, repère connu…).");
      },
      (e) => {
        if (e.code === 1) { setGeo("denied"); setGeoMsg("Vous avez refusé l'accès à votre position. Pas de problème : écrivez votre adresse ci-dessous. (Pour réessayer, autorisez la position dans les réglages de votre navigateur.)"); }
        else { setGeo("error"); setGeoMsg("Impossible de trouver votre position pour le moment (réseau ou GPS). Écrivez simplement votre adresse ci-dessous."); }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, paymentMethod: pay, operator: pay === "ussd" ? operator : undefined, location: loc, items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, unitPrice: l.price, quantity: l.quantity })) }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(d.error || "Commande impossible."); setBusy(false); return; }
    clear();
    window.location.href = `/commande/${d.id}?t=${d.token}`;
  }
  return (
    <form className="cols2" onSubmit={submit}>
      <div className="panel">
        <h3>Où devons-nous livrer ?</h3>
        {err && <div className="err" role="alert">{err}</div>}
        <div className="geo">
          <div className="geo-t">📍 Livraison plus facile</div>
          <p>Appuyez sur le bouton vert : <strong>votre adresse se remplit toute seule</strong>.</p>
          <button type="button" className="btn btn-leaf geo-btn" onClick={share} disabled={geo === "loading"}>
            {geo === "loading" ? "Recherche de votre position…" : geo === "ok" ? "📍 Actualiser ma position" : "📍 Utiliser ma position pour remplir mon adresse"}
          </button>
          <small>Votre téléphone va vous demander une autorisation : choisissez « Autoriser ». Votre position sert uniquement à cette livraison. Vous pouvez aussi écrire l&apos;adresse vous-même.</small>
          {geoMsg && <div className={geo === "ok" ? "okmsg" : "err"} role="status">{geoMsg}</div>}
        </div>
        <label htmlFor="n">Nom et prénom</label><input id="n" value={f.customerName} onChange={set("customerName")} required minLength={2} maxLength={100} autoComplete="name" />
        <label htmlFor="p">Téléphone</label><input id="p" type="tel" value={f.phone} onChange={set("phone")} required autoComplete="tel" />
        <label htmlFor="a">Adresse de livraison</label><input id="a" value={f.address} onChange={set("address")} required minLength={4} maxLength={500} autoComplete="street-address" />
        <label htmlFor="c">Ville ou quartier</label><input id="c" value={f.city} onChange={set("city")} maxLength={100} />
        <label htmlFor="i">Informations complémentaires (repère, étage…)</label><textarea id="i" rows={2} value={f.notes} onChange={set("notes")} maxLength={500} />
        <h3 style={{ marginTop: "1.4rem" }}>Mode de paiement</h3>
        {allowUssd && <div className="check"><input id="u" type="radio" checked={pay === "ussd"} onChange={() => setPay("ussd")} /><label htmlFor="u">Mobile money (USSD)</label></div>}
        {allowUssd && pay === "ussd" && <div className="chips"><button type="button" className={`chip ${operator === "TMoney" ? "on" : ""}`} onClick={() => setOperator("TMoney")}>TMoney</button><button type="button" className={`chip ${operator === "Flooz" ? "on" : ""}`} onClick={() => setOperator("Flooz")}>Flooz</button></div>}
        {allowCod && <div className="check"><input id="d" type="radio" checked={pay === "delivery"} onChange={() => setPay("delivery")} /><label htmlFor="d">Paiement à la livraison</label></div>}
        {!allowUssd && !allowCod && <div className="err">Aucun mode de paiement n&apos;est activé pour le moment.</div>}
      </div>
      <div className="panel">
        <h3>Votre commande</h3>
        {lines.map((l) => <div className="total" key={l.lineId}><span>{l.quantity} × {l.name}{l.variantLabel ? ` (${l.variantLabel})` : ""}</span><span>{fcfa(l.quantity * l.price)}</span></div>)}
        <div className="total"><span>Livraison</span><span>{fee ? fcfa(fee) : "—"}</span></div>
        <div className="total big"><span>Total</span><span>{fcfa(subtotal + fee)}</span></div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: ".8rem" }} disabled={busy || (!allowUssd && !allowCod)}>{busy ? "Envoi…" : "Confirmer la commande"}</button>
        <p className="muted" style={{ fontSize: ".8rem" }}>En commandant, vous acceptez nos <Link href="/conditions">conditions générales</Link>.</p>
      </div>
    </form>
  );
}
