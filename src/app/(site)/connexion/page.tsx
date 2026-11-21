import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";
export const metadata = { title: "Connexion" };
export default async function Page() {
  const u = await getCurrentUser();
  if (u) redirect(u.role === "customer" ? "/mon-compte" : "/admin");
  return <div className="container section"><LoginForm /></div>;
}
