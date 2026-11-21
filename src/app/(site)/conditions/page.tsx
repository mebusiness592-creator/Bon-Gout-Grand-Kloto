import type { Metadata } from "next";
export const metadata: Metadata = { title: "Conditions générales" };
export default function T() {
  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <h1>Conditions générales de vente</h1>
      <p className="muted">Texte de base à faire relire et compléter avant la mise en production.</p>
      <h3>Commandes</h3><p>Toute commande validée sur le site est soumise à la disponibilité des produits. Les prix sont indiqués en FCFA et recalculés par nos serveurs lors de la validation.</p>
      <h3>Paiement</h3><p>Le paiement peut s&apos;effectuer par mobile money (TMoney, Flooz) ou à la livraison. Un paiement mobile n&apos;est considéré comme valide qu&apos;après vérification par notre équipe.</p>
      <h3>Livraison</h3><p>La livraison est proposée selon les zones et conditions affichées lors de la commande. Les frais éventuels sont indiqués avant validation.</p>
      <h3>Annulation</h3><p>Pour toute annulation ou réclamation, contactez-nous le plus tôt possible avec votre numéro de commande.</p>
    </div>
  );
}
