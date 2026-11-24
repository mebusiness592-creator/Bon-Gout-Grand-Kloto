"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items: [string, string, boolean][] = [
  ["/admin", "Dashboard", false], ["/admin/commandes", "Commandes", false], ["/admin/plats", "Restaurant", false],
  ["/admin/categories", "Spécialités / catégories", false], ["/admin/produits", "Produits locaux", false], ["/admin/clients", "Clients", false],
  ["/admin/livraisons", "Livraisons", false], ["/admin/paiements", "Paiements", false], ["/admin/galerie", "Galerie", false],
  ["/admin/guide", "Guide de commande", false], ["/admin/notifications", "Notifications", false], ["/admin/utilisateurs", "Utilisateurs & rôles", true], ["/admin/parametres", "Paramètres", true],
];
export function AdminNav({ role, unread }: { role: string; unread: number }) {
  const path = usePathname();
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }
  return (
    <aside>
      <div className="ab">Administration</div>
      <nav className="nav-a">
        {items.filter(([, , a]) => !a || role === "admin").map(([h, l]) => (
          <Link key={h} href={h} className={path === h ? "on" : ""}>{l}{h === "/admin/notifications" && unread > 0 ? ` (${unread})` : ""}</Link>
        ))}
        <Link href="/">← Voir le site</Link>
        <Link href="/mon-compte">Mon espace client</Link>
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Déconnexion</a>
      </nav>
    </aside>
  );
}
