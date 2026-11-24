import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { guard, json } from "@/lib/guard";

const schema = z.object({
  title: z.string().trim().min(2).max(100),
  intro: z.string().trim().max(600),
  video: z.union([z.literal(""), z.string().url().max(600).refine((u) => u.startsWith("https://"), "URL https requise.")]),
  steps: z.array(z.object({ title: z.string().trim().min(1).max(80), text: z.string().trim().max(500) })).max(12),
});
export async function PUT(req: NextRequest) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return json({ error: `Guide invalide (${p.error.issues[0]?.path.join(".")}).` }, 400);
  await (await getDb()).collection("settings").updateOne({ _id: "guide" as never }, { $set: p.data }, { upsert: true });
  return json({ ok: true });
}
