import { requireStaff } from "@/lib/adminPage";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/SettingsForm";
export const metadata = { title: "Paramètres" };
export default async function Page() {
  await requireStaff(true);
  return <SettingsForm initial={await getSettings()} />;
}
