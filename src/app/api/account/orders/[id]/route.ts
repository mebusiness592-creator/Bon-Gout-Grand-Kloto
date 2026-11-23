import { NextRequest } from "next/server";
import { json, sameOrigin } from "@/lib/guard";

/** La suppression individuelle est désactivée : les commandes expirent globalement après 5 jours. */
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  return json({ error: "La suppression individuelle des commandes est désactivée. Les commandes sont conservées pendant 5 jours." }, 405);
}
