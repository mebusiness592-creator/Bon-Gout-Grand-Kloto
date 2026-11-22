"use client";
import { useEffect } from "react";

declare global {
  interface Window { OneSignalDeferred?: Array<(os: any) => void | Promise<void>> } // eslint-disable-line @typescript-eslint/no-explicit-any
}
const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

/** Charge OneSignal (si NEXT_PUBLIC_ONESIGNAL_APP_ID est défini) et relie l'appareil au compte connecté. */
export function OneSignalInit({ userId }: { userId?: string }) {
  useEffect(() => {
    if (!APP_ID) return;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    if (!document.getElementById("onesignal-sdk")) {
      const s = document.createElement("script");
      s.id = "onesignal-sdk"; s.defer = true; s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      document.head.appendChild(s);
      window.OneSignalDeferred.push(async (OS) => {
        await OS.init({ appId: APP_ID, serviceWorkerPath: "OneSignalSDKWorker.js", allowLocalhostAsSecureOrigin: true, notifyButton: { enable: false } });
      });
    }
    if (userId) window.OneSignalDeferred.push(async (OS) => { try { await OS.login(userId); } catch { /* ignoré */ } });
  }, [userId]);
  return null;
}
