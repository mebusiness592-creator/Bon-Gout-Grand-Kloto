import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileTabBar } from "@/components/MobileTabBar";
import { OneSignalInit } from "@/components/OneSignalInit";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getDb, plain } from "@/lib/db";
import { purgeOldNotifications } from "@/lib/purge";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([getCurrentUser(), getSettings()]);
  await purgeOldNotifications();
  let unread = 0;
  let notes: { _id: string; title: string; message: string; createdAt: string; read?: boolean }[] = [];
  if (user) {
    try {
      const col = (await getDb()).collection("notifications");
      const [c, list] = await Promise.all([
        col.countDocuments({ audience: "user", userId: user.id, read: false }),
        col.find({ audience: "user", userId: user.id }).sort({ createdAt: -1 }).limit(30).toArray(),
      ]);
      unread = c; notes = plain(list);
    } catch { /* ignoré */ }
  }
  return (
    <>
      <OneSignalInit userId={user?.id} />
      <SiteHeader name={s.name} user={user ? { name: user.firstName, role: user.role, avatar: user.avatar } : null} unread={unread} notes={notes} />
      <main className="site-main">{children}</main>
      <SiteFooter s={s} />
      <MobileTabBar unread={unread} accountHref={user ? "/mon-compte" : "/connexion"} />
    </>
  );
}
