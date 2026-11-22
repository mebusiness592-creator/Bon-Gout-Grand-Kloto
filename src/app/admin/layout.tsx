import { AdminNav } from "@/components/AdminNav";
import { requireStaff } from "@/lib/adminPage";
import { getDb } from "@/lib/db";
import { OneSignalInit } from "@/components/OneSignalInit";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Administration", template: "%s | Administration" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  let unread = 0;
  try { unread = await (await getDb()).collection("notifications").countDocuments({ audience: { $ne: "user" }, read: false }); } catch { /* ignoré */ }
  return <div className="adm"><OneSignalInit userId={user.id} /><AdminNav role={user.role} unread={unread} /><main>{children}</main></div>;
}
