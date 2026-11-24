"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlayCircle, X } from "lucide-react";
import type { Guide } from "@/lib/settings";

/** Bouton « Comment commander ? » : ouvre le guide (vidéo + étapes) en fenêtre agrandie. */
export function GuideButton({ guide, className = "btn btn-gold", label = "Comment commander ?" }: { guide: Guide; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}><PlayCircle size={18} /> {label}</button>
      {mounted && open && createPortal(
        <div className="modal" role="dialog" aria-modal="true" aria-label={guide.title} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="box guide-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.4rem", margin: 0 }}>{guide.title}</h2>
              <button className="xbtn" aria-label="Fermer" onClick={() => setOpen(false)}><X size={22} /></button>
            </div>
            {guide.intro && <p className="muted">{guide.intro}</p>}
            {guide.video && <video src={guide.video} controls autoPlay playsInline preload="metadata" />}
            {guide.steps.length > 0 && <ol className="guide-steps">{guide.steps.map((s, i) => <li key={i}><div><strong>{s.title}</strong>{s.text && <div className="muted" style={{ whiteSpace: "pre-line" }}>{s.text}</div>}</div></li>)}</ol>}
          </div>
        </div>, document.body)}
    </>
  );
}
