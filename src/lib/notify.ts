import { getDb } from "./db";
import { sendPush } from "./push";

/** Notification dans l'application + push OneSignal si configuré. */
export async function notify(n: { audience: "admin" | "user"; userId?: string | null; title: string; message: string; orderId?: string; type?: string }) {
  try {
    const db = await getDb();
    await db.collection("notifications").insertOne({
      audience: n.audience, userId: n.userId || null, title: n.title, message: n.message,
      orderId: n.orderId || null, type: n.type || "info", read: false, createdAt: new Date().toISOString(),
    });
    if (n.audience === "user" && n.userId) {
      await sendPush({ externalIds: [n.userId], title: n.title, message: n.message, path: n.orderId ? `/commande/${n.orderId}` : "/mon-compte" });
    } else if (n.audience === "admin") {
      const staff = await db.collection("users").find({ role: { $in: ["admin", "staff"] }, active: { $ne: false } }, { projection: { _id: 1 } }).toArray();
      await sendPush({ externalIds: staff.map((u) => u._id.toString()), title: n.title, message: n.message, path: n.type === "payment" ? "/admin/paiements" : "/admin/commandes" });
    }
  } catch { /* une notification ne doit jamais bloquer l'action principale */ }
}
