import { getDb } from "./db";
import { pushConfigured, sendPush } from "./push";

/**
 * Notifications quotidiennes (envoyées à tous les abonnés, non désactivables dans le site).
 * Heures en UTC = heure du Togo (UTC+0 toute l'année). Modifier ici pour changer les horaires.
 */
export const DAILY_SLOTS = [
  { key: "matin" as const, hour: 7 },
  { key: "midi" as const, hour: 12 },
  { key: "soir" as const, hour: 18 },
];
type Slot = (typeof DAILY_SLOTS)[number]["key"];

/** {plat} est remplacé par le nom du plat illustré ; une variante est choisie chaque jour. */
const TEXTS: Record<Slot, { title: string; body: string }[]> = {
  matin: [
    { title: "Bonjour de chez Bon Goût ☀️", body: "Bien commencer la journée, c'est bien déjeuner ! Votre petit-déjeuner vous attend au restaurant Bon Goût du Grand Kloto : {plat}." },
    { title: "Un petit-déjeuner qui a du goût ☕", body: "Prenez le temps de bien démarrer : {plat} vous attend chez Bon Goût du Grand Kloto. Commandez en quelques clics." },
    { title: "Bon matin ! 🌅", body: "N'oubliez pas votre petit-déjeuner chez Bon Goût du Grand Kloto. Aujourd'hui, craquez pour : {plat}." },
  ],
  midi: [
    { title: "C'est l'heure du déjeuner 🍽️", body: "Une faim de midi ? Bon Goût du Grand Kloto vous régale : {plat}. Commandez maintenant, on s'occupe du reste." },
    { title: "Pause déjeuner chez Bon Goût 😋", body: "Offrez-vous un vrai moment de plaisir : {plat}, préparé avec soin au restaurant Bon Goût du Grand Kloto." },
    { title: "Midi, l'heure de se régaler 🔥", body: "Ne sautez pas votre déjeuner ! {plat} vous attend chez Bon Goût du Grand Kloto, livré chez vous." },
  ],
  soir: [
    { title: "Ce soir, on se fait plaisir 🌙", body: "Pas envie de cuisiner ? Bon Goût du Grand Kloto vous propose ce soir : {plat}. Commandez en quelques clics." },
    { title: "Bonne soirée avec Bon Goût ✨", body: "Terminez la journée en beauté avec {plat}, au restaurant Bon Goût du Grand Kloto." },
    { title: "Le dîner est servi 🍛", body: "Un bon repas pour finir la journée : {plat} vous attend chez Bon Goût du Grand Kloto. Livraison à domicile." },
  ],
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Programme les 3 notifications du jour auprès d'OneSignal (envoi aux heures prévues).
 * Appelée par la tâche planifiée quotidienne ; un marqueur en base évite tout doublon le même jour.
 */
export async function scheduleDailyPushes(): Promise<{ scheduled: number; note?: string }> {
  if (!pushConfigured()) return { scheduled: 0, note: "OneSignal non configuré." };
  const db = await getDb();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  try {
    // Réservation atomique du jour : si le marqueur du jour existe déjà, l'upsert échoue (clé dupliquée) → rien n'est reprogrammé.
    await db.collection("settings").updateOne({ _id: "daily_push" as never, date: { $ne: today } } as never, { $set: { date: today } }, { upsert: true });
  } catch { return { scheduled: 0, note: "Déjà programmé aujourd'hui." }; }

  const dayNum = Math.floor(now.getTime() / 86_400_000);
  const all = (await db.collection("products").find({ section: "restaurant", available: true }).toArray()) as unknown as { _id: { toString(): string }; name: string; images?: string[]; imageUrl?: string; mealTime?: string | null }[];
  const withImg = all.filter((p) => p.images?.[0] || p.imageUrl);
  let scheduled = 0;
  for (const slot of DAILY_SLOTS) {
    if (now.getUTCHours() >= slot.hour) continue; // heure déjà passée aujourd'hui : on ne l'envoie pas tout de suite
    const exact = withImg.filter((p) => p.mealTime === slot.key);
    const pool = exact.length ? exact : withImg.filter((p) => !p.mealTime);
    const dish = pool.length ? pool[dayNum % pool.length] : undefined;
    const t = TEXTS[slot.key][dayNum % TEXTS[slot.key].length];
    const ok = await sendPush({
      segments: ["Subscribed Users"],
      title: t.title,
      message: t.body.replace("{plat}", dish ? dish.name : "nos plats faits maison"),
      image: dish ? (dish.images?.[0] || dish.imageUrl) : null,
      path: dish ? `/menu/${dish._id.toString()}` : "/menu",
      sendAfter: `${today} ${pad(slot.hour)}:00:00 GMT+0000`,
    });
    if (ok) scheduled++;
  }
  return { scheduled };
}
