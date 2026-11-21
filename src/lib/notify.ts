import { getDb } from "./db";

export async function notify(n: { audience: "admin" | "user"; userId?: string | null; title: string; message: string; orderId?: string; type?: string }) {
  try {
    await (await getDb()).collection("notifications").insertOne({
      audience: n.audience, userId: n.userId || null, title: n.title, message: n.message,
      orderId: n.orderId || null, type: n.type || "info", read: false, createdAt: new Date().toISOString(),
    });
  } catch { /* une notification ne doit jamais bloquer l'action principale */ }
}
