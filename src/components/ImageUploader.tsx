"use client";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";

const IMG = ["image/jpeg", "image/png", "image/webp"];
const VID = ["video/mp4", "video/webm", "video/quicktime"];

function xhrUpload(url: string, fd: FormData, onP: (n: number) => void): Promise<{ secure_url?: string }> {
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest();
    x.open("POST", url);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onP(Math.round((e.loaded / e.total) * 100)); };
    x.onload = () => {
      try { const d = JSON.parse(x.responseText); if (x.status >= 200 && x.status < 300) res(d); else rej(new Error(d.error?.message || "Échec de l'envoi vers Cloudinary.")); }
      catch { rej(new Error("Réponse invalide de Cloudinary.")); }
    };
    x.onerror = () => rej(new Error("Connexion perdue pendant l'envoi."));
    x.send(fd);
  });
}

/** Envoi direct navigateur → Cloudinary (signature fournie par le serveur) : les fichiers ne transitent pas par Vercel. */
export function ImageUploader({ value, onChange, max = 6, video = false, videoOnly = false, onUploaded }: { value: string[]; onChange: (v: string[]) => void; max?: number; video?: boolean; videoOnly?: boolean; onUploaded?: (r: { url: string; kind: "image" | "video" }) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false); const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const allowVideo = video || videoOnly;

  async function upload(file: File): Promise<{ url: string; kind: "image" | "video" }> {
    const kind: "image" | "video" = VID.includes(file.type) ? "video" : "image";
    if (videoOnly && kind !== "video") throw new Error("Formats vidéo acceptés : MP4, WebM, MOV.");
    if (kind === "image" && !IMG.includes(file.type)) throw new Error("Formats acceptés : JPG, PNG, WEBP" + (allowVideo ? ", MP4, WebM, MOV." : "."));
    if (kind === "video" && !allowVideo) throw new Error("Les vidéos ne sont pas acceptées ici.");
    if (kind === "image" && file.size > 10 * 1024 * 1024) throw new Error("Image limitée à 10 Mo.");
    if (kind === "video" && file.size > 80 * 1024 * 1024) throw new Error("Vidéo limitée à 80 Mo.");
    const sr = await fetch("/api/admin/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
    const sig = await sr.json();
    if (!sr.ok) throw new Error(sig.error || "Signature refusée.");
    const fd = new FormData();
    fd.append("file", file); fd.append("api_key", sig.apiKey); fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature); fd.append("folder", sig.folder); fd.append("allowed_formats", sig.allowed_formats);
    setPct(0);
    const res = await xhrUpload(`https://api.cloudinary.com/v1_1/${sig.cloudName}/${kind}/upload`, fd, setPct);
    if (!res.secure_url) throw new Error("Échec de l'envoi vers Cloudinary.");
    return { url: res.secure_url, kind };
  }
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true); setErr("");
    try {
      let next = [...value];
      for (const f of files) {
        if (next.length >= max) break;
        const r = await upload(f);
        next = max === 1 ? [r.url] : [...next, r.url];
        onUploaded?.(r);
      }
      onChange(next);
    } catch (x) { setErr(x instanceof Error ? x.message : "Erreur d'envoi."); }
    setBusy(false); setPct(0);
  }
  const label = videoOnly ? "Ajouter une vidéo" : max === 1 && value.length ? "Remplacer" : video ? "Ajouter photo / vidéo" : "Ajouter une photo";
  return (
    <div>
      <div className="uploads">
        {value.map((u) => (
          <div className="th" key={u}>
            {/\.(mp4|webm|mov)$/i.test(u) ? <video src={u} /> : <img src={u} alt="Aperçu" />}
            <button type="button" aria-label="Supprimer" onClick={() => onChange(value.filter((x) => x !== u))}>×</button>
          </div>
        ))}
      </div>
      {value.length < max && <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--brown)" }} disabled={busy} onClick={() => ref.current?.click()}><Upload size={15} /> {busy ? `Envoi… ${pct}%` : label}</button>}
      {busy && <div className="bar"><i style={{ width: `${pct}%` }} /></div>}
      <input ref={ref} type="file" hidden multiple={max > 1} accept={(videoOnly ? VID : video ? [...IMG, ...VID] : IMG).join(",")} onChange={pick} />
      {err && <div className="err">{err}</div>}
    </div>
  );
}
