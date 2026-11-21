import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { OrdersManager } from "@/components/OrdersManager";
import type { Order } from "@/lib/types";

export const metadata = { title: "Paiements" };
export default async function Page() {
  await requireStaff();
  const orders: Order[] = plain(await (await getDb()).collection("orders").find().sort({ createdAt: -1 }).limit(300).toArray());
  return <OrdersManager orders={orders} mode="payments" />;
}
