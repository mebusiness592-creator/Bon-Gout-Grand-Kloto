import type { Db } from "mongodb";
import { getDb } from "./db";

const DAY = 24 * 60 * 60 * 1000;
/** Durées de conservation (modifiables ici). */
export const ORDER_RETENTION_DAYS = 10;        // commandes (et leur historique de statuts, qui vit dans la commande)
export const NOTIFICATION_RETENTION_DAYS = 5;  // notifications

let last = 0;
let ttlOk = false;

/** Garantit l'index TTL des commandes à la bonne durée (corrige l'ancien index de 5 jours s'il existe). */
async function ensureOrderTtl(db: Db) {
  if (ttlOk) return;
  const col = db.collection("orders");
  const secs = ORDER_RETENTION_DAYS * 24 * 60 * 60;
  let existing: { name?: string; expireAfterSeconds?: number } | undefined;
  try {
    const idx = (await col.indexes()) as { name?: string; key?: Record<string, number>; expireAfterSeconds?: number }[];
    existing = idx.find((i) => i.key && Object.keys(i.key).length === 1 && i.key.createdAtDate === 1);
  } catch { /* la collection n'existe pas encore : l'index sera créé ci-dessous */ }
  if (existing && existing.expireAfterSeconds === secs) { ttlOk = true; return; }
  if (existing) {
    try {
      await db.command({ collMod: "orders", index: { keyPattern: { createdAtDate: 1 }, expireAfterSeconds: secs } });
      ttlOk = true; return;
    } catch {
      try { await col.dropIndex(existing.name as string); } catch { /* ignoré */ }
    }
  }
  await col.createIndex({ createdAtDate: 1 }, { expireAfterSeconds: secs, name: "orders_expire_after_10_days" });
  ttlOk = true;
}

/** Nettoyage : notifications (5 jours) et commandes (10 jours). L'historique des statuts est supprimé avec sa commande. */
export async function purgeOldRecords(force = false) {
  const now = Date.now();
  if (!force && now - last < 10 * 60 * 1000) return;
  last = now;
  try {
    const db = await getDb();
    const notifCutoff = new Date(now - NOTIFICATION_RETENTION_DAYS * DAY).toISOString();
    const orderCutoff = new Date(now - ORDER_RETENTION_DAYS * DAY);
    const orderCutoffIso = orderCutoff.toISOString();
    try { await ensureOrderTtl(db); } catch { /* le deleteMany ci-dessous assure le nettoyage même sans index */ }
    await Promise.all([
      db.collection("notifications").deleteMany({ createdAt: { $lt: notifCutoff } }),
      // Nouvelles commandes (date BSON) + anciennes commandes (date ISO texte, sans createdAtDate).
      db.collection("orders").deleteMany({
        $or: [
          { createdAtDate: { $type: "date", $lt: orderCutoff } },
          { createdAt: { $type: "string", $lt: orderCutoffIso }, createdAtDate: { $exists: false } },
        ],
      }),
    ]);
  } catch {
    // Le nettoyage ne doit jamais bloquer l'affichage ou une commande.
  }
}

/** Ancien nom conservé pour les appels existants dans le projet. */
export async function purgeOldNotifications() {
  await purgeOldRecords();
}
