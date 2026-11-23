import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { json, sameOrigin, tooMany } from "@/lib/guard";
import { cloudinaryConfigured, signUpload } from "@/lib/cloudinary";

/** Signature Cloudinary pour la photo de profil (images seulement, dossier avatars). */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Connexion requise." }, 401);
  if (tooMany("avsign:" + user.id, 15)) return json({ error: "Trop d'envois. Réessayez plus tard." }, 429);
  if (!cloudinaryConfigured()) return json({ error: "L'envoi de photos n'est pas configuré." }, 500);
  return json(signUpload("image", "bon-gout-grand-kloto/avatars"));
}
