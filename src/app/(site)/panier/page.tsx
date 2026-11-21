import { CartView } from "@/components/CartView";
import { getSettings } from "@/lib/settings";
export const metadata = { title: "Mon panier" };
export default async function Page() {
  const s = await getSettings();
  return <div className="container section"><h1>Mon panier</h1><CartView deliveryFee={s.deliveryFee} freeFrom={s.freeDeliveryFrom} /></div>;
}
