import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb, plain } from "@/lib/db";
import { AccountDashboard } from "@/components/AccountDashboard";
import type { Order } from "@/lib/types";
export const metadata = { title: "Mon compte" };

export default async function Account() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/mon-compte");
  const db = await getDb();
  const [orders, notes] = await Promise.all([
    db.collection("orders").find({ userId: user.id, hiddenByUser: { $ne: true } }).sort({ createdAt: -1 }).limit(50).toArray(),
    db.collection("notifications").find({ audience: "user", userId: user.id }).sort({ createdAt: -1 }).limit(30).toArray(),
  ]);
  const ns = plain<{ _id: string; title: string; message: string; createdAt: string; read?: boolean }[]>(notes);
  return (
    <div className="container section">
      <AccountDashboard user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, address: user.address || "", city: user.city || "", avatar: user.avatar || "", role: user.role }}
        orders={plain<Order[]>(orders)} notes={ns} unread={ns.filter((n) => !n.read).length} />
    </div>
  );
}
