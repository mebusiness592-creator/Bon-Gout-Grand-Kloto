"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const isVideo = (u: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(u);

/**
 * Diaporama automatique d'images ET de vidéos.
 * - une image reste affichée `interval` ms (4,5 s par défaut) ;
 * - une vidéo est lue en entier (muette, comme l'exige le navigateur pour l'autoplay), puis on passe au média suivant ;
 * - si une vidéo ne démarre pas ou échoue, on passe au suivant (délai de sécurité de 90 s).
 * À placer dans un conteneur en position relative.
 */
export function Slides({ images, interval = 4500 }: { images: string[]; interval?: number }) {
  const [cur, setCur] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const n = images.length;
  const i = n ? cur % n : 0;
  const next = useCallback(() => setCur((x) => (x + 1) % Math.max(1, n)), [n]);

  useEffect(() => {
    if (n < 2) return;
    const ms = isVideo(images[i]) ? 90_000 : interval;
    const t = setTimeout(next, ms);
    return () => clearTimeout(t);
  }, [i, n, images, interval, next]);

  useEffect(() => {
    refs.current.forEach((v, k) => {
      if (!v) return;
      if (k === i) { try { v.currentTime = 0; } catch { /* ignoré */ } v.play().catch(() => { /* lecture bloquée : le délai de sécurité prend le relais */ }); } else v.pause();
    });
  }, [i, n]);

  if (!n) return null;
  return (
    <>
      {images.map((u, k) => isVideo(u)
        ? <video key={u + k} ref={(el) => { refs.current[k] = el; }} src={u} className={`slide ${k === i ? "on" : ""}`} muted playsInline preload={k === i ? "auto" : "metadata"} loop={n === 1} onEnded={next} onError={next} />
        : <img key={u + k} src={u} alt="" className={`slide ${k === i ? "on" : ""}`} loading={k === 0 ? "eager" : "lazy"} />)}
      {n > 1 && <div className="dots">{images.map((_, k) => <button key={k} aria-label={`Média ${k + 1}`} className={k === i ? "on" : ""} onClick={() => setCur(k)} />)}</div>}
    </>
  );
}
