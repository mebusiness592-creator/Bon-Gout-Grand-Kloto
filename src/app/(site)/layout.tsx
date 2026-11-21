import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileTabBar } from "@/components/MobileTabBar";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <>
      <SiteHeader name={s.name} user={user ? { name: user.firstName, role: user.role } : null} />
      <main className="site-main">{children}</main>
      <SiteFooter s={s} />
      <MobileTabBar accountHref={user ? (user.role === "customer" ? "/mon-compte" : "/admin") : "/connexion"} />
    </>
  );
}
