import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";
export const metadata = { title: "Créer un compte" };
export default async function Page() {
  if (await getCurrentUser()) redirect("/mon-compte");
  return <div className="container section"><RegisterForm /></div>;
}
