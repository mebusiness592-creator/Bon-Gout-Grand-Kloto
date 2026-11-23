import { getSettings } from "@/lib/settings";
import { PasswordRecoveryHelp } from "@/components/PasswordRecoveryHelp";
export const metadata = { title: "Mot de passe oublié" };
export default async function Page() {
  const s = await getSettings();
  return (
    <div className="container section">
      <PasswordRecoveryHelp phone={s.phone} whatsapp={s.whatsapp} />
    </div>
  );
}
