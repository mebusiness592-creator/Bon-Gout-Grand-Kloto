import { NextRequest } from "next/server";
import { json, sameOrigin } from "@/lib/guard";

/** Les clients ne peuvent pas supprimer leurs commandes (la suppression se ferait aussi chez le restaurant). Elles expirent automatiquement après 10 jours. */
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  return json({ error: "La suppression des commandes n'est pas disponible côté client. Les commandes sont supprimées automatiquement après 10 jours." }, 405);
}
