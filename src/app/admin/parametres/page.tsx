import { requireStaff } from "@/lib/adminPage";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/SettingsForm";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { pushConfigured } from "@/lib/push";
export const metadata = { title: "Paramètres" };

export default async function Page() {
  await requireStaff(true);
  const checks: [string, boolean][] = [
    ["Photos et vidéos (Cloudinary)", cloudinaryConfigured()],
    ["Notifications push (OneSignal)", pushConfigured() && Boolean(process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)],
    ["Paiement TMoney (code USSD)", Boolean(process.env.USSD_TMoney_TEMPLATE)],
    ["Paiement Flooz (code USSD)", Boolean(process.env.USSD_Flooz_TEMPLATE)],
  ];
  return (
    <div>
      <div className="panel" style={{ maxWidth: 760, marginBottom: "1rem" }}>
        <h3>État de la configuration</h3>
        {checks.map(([l, ok]) => <div key={l} className="total"><span>{l}</span><span className={`st ${ok ? "green" : "amber"}`}>{ok ? "Configuré" : "À configurer"}</span></div>)}
        <p className="muted" style={{ fontSize: ".82rem", margin: 0 }}>Ces éléments se règlent dans les variables d&apos;environnement Vercel (aucune clé n&apos;est affichée ici).</p>
      </div>
      <SettingsForm initial={await getSettings()} />
    </div>
  );
}
