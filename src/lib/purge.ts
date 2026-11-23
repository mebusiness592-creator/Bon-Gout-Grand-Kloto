import { getDb } from "./db";

let last = 0;
const DAY = 24 * 60 * 60 * 1000;

/** Nettoyage des notifications (2 jours), des historiques de commande (2 jours)
 * et des commandes (5 jours). Le TTL MongoDB complète le nettoyage des commandes.
 */
export async function purgeOldRecords(force = false) {
  const now = Date.now();
  if (!force && now - last < 10 * 60 * 1000) return;
  last = now;
  try {
    const db = await getDb();
    const cutoff2d = new Date(now - 2 * DAY).toISOString();
    const cutoff5d = new Date(now - 5 * DAY);
    const cutoff5dIso = cutoff5d.toISOString();

    await db.collection("orders").createIndex(
      { createdAtDate: 1 },
      { expireAfterSeconds: 5 * 24 * 60 * 60, name: "orders_expire_after_5_days" },
    );

    await Promise.all([
      db.collection("notifications").deleteMany({ createdAt: { $lt: cutoff2d } }),
      // Les entrées d'historique sont des sous-documents : on retire uniquement
      // les actions anciennes sans supprimer la commande qui les contient.
      db.collection("orders").updateMany(
        { history: { $exists: true, $ne: [] } },
        { $pull: { history: { at: { $lt: cutoff2d } } } } as never,
      ),
      // Compatibilité avec les commandes historiques et leurs dates ISO.
      db.collection("orders").deleteMany({
        $or: [
          { createdAtDate: { $type: "date", $lt: cutoff5d } },
          { createdAt: { $type: "string", $lt: cutoff5dIso }, createdAtDate: { $exists: false } },
        ],
      }),
    ]);

    // MongoDB expire les nouvelles commandes automatiquement à 5 jours ; le
    // deleteMany ci-dessus couvre également les commandes créées avant cette version.
  } catch {
    // Le nettoyage ne doit jamais bloquer l'affichage ou une commande.
  }
}

/** Ancien nom conservé pour les appels existants dans le projet. */
export async function purgeOldNotifications() {
  await purgeOldRecords();
}
