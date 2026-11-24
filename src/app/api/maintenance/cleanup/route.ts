import { NextRequest } from "next/server";
import { purgeOldRecords } from "@/lib/purge";
import { scheduleDailyPushes } from "@/lib/daily";
import { json } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Point d'entrée planifié par Vercel (chaque nuit) : nettoyage + programmation des notifications du jour. Protégé par CRON_SECRET. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return json({ error: "Accès refusé." }, 401);
  }
  await purgeOldRecords(true);
  let daily: { scheduled: number; note?: string } = { scheduled: 0 };
  try { daily = await scheduleDailyPushes(); } catch { /* ne doit pas empêcher le nettoyage */ }
  return json({ ok: true, message: "Nettoyage effectué.", dailyNotifications: daily });
}
