"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

export function PasswordRecoveryHelp({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const [account, setAccount] = useState("");
  const [fullName, setFullName] = useState("");
  const digits = whatsapp.replace(/\D/g, "").replace(/^00/, "");
  const message = useMemo(() => {
    return `Bonjour, j'ai oublié mon mot de passe sur le site Bon Goût du Grand Kloto.\nNom complet : ${fullName.trim() || "À préciser"}\nTéléphone ou e-mail du compte : ${account.trim() || "À préciser"}\nJe souhaite récupérer l'accès à mon compte.`;
  }, [account, fullName]);
  const waHref = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : "";
  return (
    <div className="form panel">
      <h1 style={{ fontSize: "1.6rem" }}>Récupérer mon compte</h1>
      <p>Vous n'avez pas besoin d'envoyer un e-mail. Remplissez ces informations puis contactez notre équipe sur WhatsApp pour demander la récupération de votre compte.</p>
      <label htmlFor="recovery-name">Votre nom complet</label>
      <input id="recovery-name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} placeholder="Nom et prénom" />
      <label htmlFor="recovery-account">Téléphone ou e-mail utilisé à l'inscription</label>
      <input id="recovery-account" value={account} onChange={(e) => setAccount(e.target.value)} maxLength={120} placeholder="Votre téléphone ou e-mail" />
      {waHref ? (
        <a className="btn btn-leaf" style={{ width: "100%", marginTop: "1rem" }} href={waHref} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} /> Demander de l'aide sur WhatsApp
        </a>
      ) : phone ? (
        <a className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} href={`tel:${phone}`}>
          <Phone size={18} /> Appeler le restaurant
        </a>
      ) : <p className="err">Les coordonnées du restaurant ne sont pas encore configurées. Contactez directement le restaurant.</p>}
      <p className="muted" style={{ fontSize: ".82rem", marginTop: "1rem" }}>
        Pour votre sécurité, l'équipe vérifiera votre identité avant toute réinitialisation. Ne communiquez jamais votre ancien mot de passe ni un code secret. La demande WhatsApp ne réinitialise pas automatiquement votre mot de passe.
      </p>
      <Link href="/connexion" className="btn btn-light" style={{ width: "100%" }}>Retour à la connexion</Link>
    </div>
  );
}
