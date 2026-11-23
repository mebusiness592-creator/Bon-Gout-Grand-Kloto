import { NextRequest } from "next/server";
import { purgeOldRecords } from "@/lib/purge";
import { json } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Point d'entrée planifié par Vercel. Protéger avec CRON_SECRET dans les variables Vercel. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return json({ error: "Accès refusé." }, 401);
  }
  await purgeOldRecords(true);
  return json({ ok: true, message: "Nettoyage effectué." });
}
