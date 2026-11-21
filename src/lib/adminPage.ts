import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";

/** Contrôle d'accès exécuté sur CHAQUE page d'administration (le layout seul ne suffit pas). Rôle relu en base. */
export async function requireStaff(adminOnly = false) {
  const u = await getCurrentUser();
  if (!u) redirect("/connexion?next=/admin");
  if (u.role === "customer") redirect("/");
  if (adminOnly && u.role !== "admin") redirect("/admin");
  return u;
}
