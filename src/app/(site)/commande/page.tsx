import { CheckoutForm } from "@/components/CheckoutForm";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
export const metadata = { title: "Valider ma commande" };
export default async function Page() {
  const [s, u] = await Promise.all([getSettings(), getCurrentUser()]);
  return (
    <div className="container section"><h1>Finaliser ma commande</h1>
      {!u && <p className="muted">Vous avez un compte ? <a href="/connexion?next=/commande">Connectez-vous</a> pour retrouver vos informations et suivre vos commandes.</p>}
      <CheckoutForm deliveryFee={s.deliveryFee} freeFrom={s.freeDeliveryFrom} allowCod={s.allowCod} allowUssd={s.allowUssd}
        defaults={{ name: u ? `${u.firstName} ${u.lastName}` : "", phone: u?.phone || "", address: u?.address || "", city: u?.city || "" }} />
    </div>
  );
}
