export function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string; size?: number }) {
  const init = (name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return src
    ? <img className="avatar" src={src} alt="" style={{ width: size, height: size }} />
    : <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>{init}</span>;
}
