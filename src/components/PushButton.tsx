"use client";
import { useState } from "react";
import { Bell } from "lucide-react";

/** Bouton « Activer les notifications » : la permission est demandée seulement quand la personne appuie. */
export function PushButton() {
  const [msg, setMsg] = useState("");
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return null;
  function ask() {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OS) => {
      try {
        await OS.Notifications.requestPermission();
        setMsg(OS.Notifications.permission ? "Notifications activées sur cet appareil." : "Notifications refusées : vous pouvez les autoriser dans les réglages du navigateur.");
      } catch { setMsg("Activation impossible sur cet appareil. Sur iPhone, installez d'abord le site sur l'écran d'accueil."); }
    });
  }
  return <div style={{ margin: ".6rem 0" }}><button type="button" className="btn btn-gold btn-sm" onClick={ask}><Bell size={15} /> Activer les notifications</button>{msg && <p className="muted" style={{ fontSize: ".85rem" }}>{msg}</p>}</div>;
}
