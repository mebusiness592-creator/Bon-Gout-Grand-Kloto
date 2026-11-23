import { getDb } from "./db";

let last = 0;
/** Supprime les notifications de plus de 2 jours (au plus une fois toutes les 10 minutes par instance). */
export async function purgeOldNotifications() {
  const now = Date.now();
  if (now - last < 10 * 60 * 1000) return;
  last = now;
  try {
    const cutoff = new Date(now - 2 * 86400000).toISOString();
    await (await getDb()).collection("notifications").deleteMany({ createdAt: { $lt: cutoff } });
  } catch { /* ignoré */ }
}
