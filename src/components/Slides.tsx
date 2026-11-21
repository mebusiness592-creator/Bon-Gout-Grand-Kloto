"use client";
import { useEffect, useState } from "react";

/** Diaporama automatique (4,5 s par défaut). À placer dans un conteneur en position relative. */
export function Slides({ images, interval = 4500 }: { images: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);
  if (!images.length) return null;
  return (
    <>
      {images.map((u, k) => <img key={u} src={u} alt="" className={`slide ${k === i ? "on" : ""}`} loading={k === 0 ? "eager" : "lazy"} />)}
      {images.length > 1 && <div className="dots">{images.map((_, k) => <button key={k} aria-label={`Image ${k + 1}`} className={k === i ? "on" : ""} onClick={() => setI(k)} />)}</div>}
    </>
  );
}
