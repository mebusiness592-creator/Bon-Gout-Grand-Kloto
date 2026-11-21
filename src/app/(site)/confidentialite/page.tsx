import type { Metadata } from "next";
export const metadata: Metadata = { title: "Politique de confidentialité" };
export default function T() {
  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <h1>Politique de confidentialité</h1>
      <p className="muted">Texte de base à faire relire et compléter avant la mise en production.</p>
      <h3>Données collectées</h3><p>Nom, téléphone, e-mail, adresse de livraison et, uniquement si vous l&apos;autorisez, votre position GPS au moment de la commande.</p>
      <h3>Utilisation</h3><p>Ces données servent uniquement à traiter et livrer vos commandes et à gérer votre compte. Elles ne sont pas revendues.</p>
      <h3>Sécurité</h3><p>Les mots de passe sont chiffrés (hachés). Vous pouvez demander la modification ou la suppression de vos données en nous contactant.</p>
    </div>
  );
}
