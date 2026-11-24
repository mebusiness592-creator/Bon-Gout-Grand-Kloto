"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import type { Guide } from "@/lib/settings";

export function GuideAdmin({ initial }: { initial: Guide }) {
  const router = useRouter();
  const [g, setG] = useState<Guide>(initial);
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(""); setErr("");
    const r = await fetch("/api/admin/guide", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...g, steps: g.steps.filter((s) => s.title.trim()) }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setMsg("Guide enregistré. Il s'affiche sur l'accueil du site."); router.refresh(); } else setErr(d.error || "Enregistrement impossible.");
  }
  const setStep = (i: number, patch: Partial<Guide["steps"][number]>) => setG({ ...g, steps: g.steps.map((s, k) => (k === i ? { ...s, ...patch } : s)) });
  return (
    <form className="panel" onSubmit={save} style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: "1.7rem" }}>Guide de commande</h1>
      <p className="muted">Expliquez aux clients comment commander. Sur l&apos;accueil, un bouton « Comment commander ? » ouvre ce guide en fenêtre agrandie (vidéo + étapes).</p>
      {msg && <div className="okmsg">{msg}</div>}{err && <div className="err">{err}</div>}
      <label>Titre</label><input value={g.title} maxLength={100} onChange={(e) => setG({ ...g, title: e.target.value })} required />
      <label>Introduction (facultatif)</label><textarea rows={2} maxLength={600} value={g.intro} onChange={(e) => setG({ ...g, intro: e.target.value })} />
      <label>Vidéo du guide (facultatif)</label>
      <ImageUploader videoOnly max={1} value={g.video ? [g.video] : []} onChange={(v) => setG({ ...g, video: v[0] || "" })} />
      <h3 style={{ marginTop: "1.2rem" }}>Étapes (renseignements pour commander)</h3>
      {g.steps.map((s, i) => (
        <div key={i} className="vrow" style={{ alignItems: "start" }}>
          <div><input placeholder="Titre de l'étape (ex. Choisissez votre plat)" maxLength={80} value={s.title} onChange={(e) => setStep(i, { title: e.target.value })} />
            <textarea rows={2} placeholder="Explication" maxLength={500} value={s.text} onChange={(e) => setStep(i, { text: e.target.value })} style={{ marginTop: ".4rem" }} /></div>
          <span /><button type="button" className="btn btn-sm btn-danger" aria-label="Supprimer l'étape" onClick={() => setG({ ...g, steps: g.steps.filter((_, k) => k !== i) })}><Trash2 size={14} /></button>
        </div>))}
      <button type="button" className="btn btn-sm btn-light" style={{ marginTop: ".5rem" }} onClick={() => setG({ ...g, steps: [...g.steps, { title: "", text: "" }] })}><Plus size={14} /> Ajouter une étape</button>
      <div><button className="btn btn-primary" style={{ marginTop: "1.2rem" }} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button></div>
    </form>
  );
}
