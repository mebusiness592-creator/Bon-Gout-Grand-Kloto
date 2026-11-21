
import Link from "next/link";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Confirmation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return (
      <main className="container section">
        <h1>Commande introuvable</h1>
        <Link href="/">Retour à l'accueil</Link>
      </main>
    );
  }

  const db = await getDb();

  const commande = await db
    .collection("commandes")
    .findOne({ _id: new ObjectId(id) });

  if (!commande) {
    return (
      <main className="container section">
        <h1>Commande introuvable</h1>
        <Link href="/">Retour à l'accueil</Link>
      </main>
    );
  }

  const template =
    commande.operator === "Flooz"
      ? process.env.USSD_Flooz_TEMPLATE
      : process.env.USSD_TMoney_TEMPLATE;

  const ussd = template
    ?.replace("{amount}", String(commande.total))
    .replace("{reference}", commande.reference)
    .replace("{phone}", commande.phone);

  return (
    <main className="container section" style={{ maxWidth: 700 }}>
      <div className="card" style={{ padding: 28 }}>
        <div className="eyebrow">Commande reçue</div>

        <h1 className="serif" style={{ color: "var(--forest)" }}>
          Merci pour votre commande !
        </h1>

        <p>
          Référence : <strong>{commande.reference}</strong>
        </p>

        <h2>{commande.total.toLocaleString("fr-FR")} F CFA</h2>

        <p>
          Statut :{" "}
          {commande.status === "pending"
            ? "En attente de confirmation"
            : commande.status}
        </p>

        {commande.paymentMethod === "ussd" ? (
          <>
            <p>Opérateur choisi : {commande.operator}</p>

            {ussd ? (
              <>
                <p>
                  Vous pouvez ouvrir le composeur téléphonique avec le code
                  préparé. Vérifiez les informations avant de valider.
                </p>

                <a
                  className="btn btn-primary"
                  href={`tel:${encodeURIComponent(ussd)}`}
                >
                  Ouvrir le paiement USSD
                </a>
              </>
            ) : (
              <p>
                Le code USSD n'est pas encore configuré. Notre équipe pourra
                vous communiquer les instructions de paiement.
              </p>
            )}

            <p className="muted">
              Le paiement sera confirmé par notre équipe après vérification
              auprès de l'opérateur.
            </p>
          </>
        ) : (
          <p>
            Vous avez choisi le paiement à la livraison. Préparez le montant
            à régler à la réception.
          </p>
        )}

        <p>
          <Link href="/">Retour à l'accueil</Link>
        </p>
      </div>
    </main>
  );
}
