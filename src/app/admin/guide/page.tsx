import { requireStaff } from "@/lib/adminPage";
import { getGuide } from "@/lib/settings";
import { GuideAdmin } from "@/components/GuideAdmin";
export const metadata = { title: "Guide de commande" };

export default async function Page() {
  await requireStaff();
  return <GuideAdmin initial={await getGuide()} />;
}
