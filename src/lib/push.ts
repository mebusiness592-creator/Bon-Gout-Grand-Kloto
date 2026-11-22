/** Envoi de notifications push via l'API REST OneSignal (clé uniquement côté serveur). Sans clés : ne fait rien. */
export function pushConfigured(): boolean {
  return Boolean(process.env.ONESIGNAL_REST_API_KEY && (process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID));
}
export async function sendPush(o: { externalIds: string[]; title: string; message: string; path?: string }) {
  const key = process.env.ONESIGNAL_REST_API_KEY;
  const appId = process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!key || !appId || !o.externalIds.length) return;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Key ${key}` },
      body: JSON.stringify({
        app_id: appId, target_channel: "push", include_aliases: { external_id: o.externalIds },
        headings: { en: o.title, fr: o.title }, contents: { en: o.message, fr: o.message },
        ...(site && o.path ? { url: site + o.path } : {}),
      }),
    });
  } catch { /* une notification push ne doit jamais bloquer l'action principale */ }
  clearTimeout(timer);
}
