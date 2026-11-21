import { NextRequest } from "next/server";
import { destroySession } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  await destroySession();
  return json({ ok: true });
}
