import Link from "next/link";
import { getSettings } from "@/lib/settings";
export const metadata = { title: "Mot de passe oublié" };
export default async function Page() {
  const s = await getSettings();
  return (
    <div className="container section"><div className="form panel">
      <h1 style={{ fontSize: "1.6rem" }}>Mot de passe oublié</h1>
      <p>La réinitialisation automatique par e-mail n&apos;est pas encore activée sur ce site.</p>
      <p>Contactez-nous{s.phone ? <> au <a href={`tel:${s.phone}`}>{s.phone}</a></> : ""}{s.email ? <> ou par <a href={`mailto:${s.email}`}>e-mail</a></> : ""} : un administrateur peut définir un nouveau mot de passe temporaire pour votre compte.</p>
      <Link href="/connexion" className="btn btn-primary">Retour à la connexion</Link>
    </div></div>
  );
}
