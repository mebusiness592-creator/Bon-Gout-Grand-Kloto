import { NextRequest } from "next/server";
import { guard, json } from "@/lib/guard";
import { cloudinaryConfigured, signUpload } from "@/lib/cloudinary";

/** Renvoie une signature Cloudinary : le fichier part directement du navigateur vers Cloudinary, la clé secrète reste côté serveur. */
export async function POST(req: NextRequest) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  if (!cloudinaryConfigured()) return json({ error: "Cloudinary n'est pas configuré (variables CLOUDINARY_*)." }, 500);
  const body = await req.json().catch(() => ({}));
  return json(signUpload(body.kind === "video" ? "video" : "image"));
}
