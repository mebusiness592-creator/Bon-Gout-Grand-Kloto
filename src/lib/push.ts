/** Envoi de notifications push via l'API REST OneSignal (clé uniquement côté serveur). Sans clés : ne fait rien. */
export function pushConfigured(): boolean {
  return Boolean(process.env.ONESIGNAL_REST_API_KEY && (process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID));
}
type PushOptions = {
  externalIds?: string[];           // appareils reliés à des comptes
  segments?: string[];              // ou un segment OneSignal (ex. « Subscribed Users » = tous les abonnés)
  title: string; message: string; path?: string;
  image?: string | null;            // image affichée dans la notification (plat, produit…)
  sendAfter?: string;               // envoi programmé : « 2026-11-25 07:00:00 GMT+0000 »
};
export async function sendPush(o: PushOptions): Promise<boolean> {
  const key = process.env.ONESIGNAL_REST_API_KEY;
  const appId = process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!key || !appId) return false;
  if (!o.segments?.length && !o.externalIds?.length) return false;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  let ok = false;
  try {
    const r = await fetch("https://api.onesignal.com/notifications", {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Key ${key}` },
      body: JSON.stringify({
        app_id: appId, target_channel: "push",
        ...(o.segments?.length ? { included_segments: o.segments } : { include_aliases: { external_id: o.externalIds } }),
        headings: { en: o.title, fr: o.title }, contents: { en: o.message, fr: o.message },
        ...(site && o.path ? { url: site + o.path } : {}),
        ...(o.image ? { big_picture: o.image, chrome_web_image: o.image, ios_attachments: { id1: o.image } } : {}),
        ...(o.sendAfter ? { send_after: o.sendAfter } : {}),
      }),
    });
    ok = r.ok;
  } catch { /* une notification push ne doit jamais bloquer l'action principale */ }
  clearTimeout(timer);
  return ok;
}
