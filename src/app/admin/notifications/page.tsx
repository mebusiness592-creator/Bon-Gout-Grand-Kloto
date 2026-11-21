import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { NotificationsAdmin } from "@/components/NotificationsAdmin";
export const metadata = { title: "Notifications" };
export default async function Page() {
  await requireStaff();
  const items = await (await getDb()).collection("notifications").find({ audience: { $ne: "user" } }).sort({ createdAt: -1 }).limit(100).toArray();
  return <NotificationsAdmin items={plain(items)} />;
}
