import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OneSignalInit } from "@/components/OneSignalInit";
import { getDb } from "@/lib/db";
import { MobileTabBar } from "@/components/MobileTabBar";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([getCurrentUser(), getSettings()]);
  let unread = 0;
  if (user) { try { unread = await (await getDb()).collection("notifications").countDocuments({ audience: "user", userId: user.id, read: false }); } catch { /* ignoré */ } }
  return (
    <>
      <OneSignalInit userId={user?.id} />
      <SiteHeader name={s.name} user={user ? { name: user.firstName, role: user.role } : null} unread={unread} />
      <main className="site-main">{children}</main>
      <SiteFooter s={s} />
      <MobileTabBar unread={unread} accountHref={user ? (user.role === "customer" ? "/mon-compte" : "/admin") : "/connexion"} />
    </>
  );
}
