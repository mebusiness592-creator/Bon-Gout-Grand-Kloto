import Link from "next/link";
import type { Product } from "@/lib/types";
import { effectivePrice, fcfa, isPromo, productImage } from "@/lib/pricing";
import { AddToCart } from "./AddToCart";

export function ProductCard({ p }: { p: Product }) {
  const price = effectivePrice(p);
  const img = productImage(p);
  const href = (p.section === "restaurant" ? "/menu/" : "/produits/") + p._id;
  const out = !p.available || (typeof p.stock === "number" && p.stock <= 0);
  return (
    <article className="card">
      <Link href={href} className="card-img" aria-label={p.name}>
        {img ? <img src={img} alt={p.name} loading="lazy" /> : <div className="ph">{p.section === "restaurant" ? "🍛" : "🌴"}</div>}
        {isPromo(p) && <span className="badge promo">Promo</span>}
      </Link>
      <div className="card-body">
        <h3><Link href={href}>{p.name}</Link></h3>
        {p.format && <span className="pill">{p.format}</span>}
        {p.description && <p className="muted clamp">{p.description}</p>}
        <div className="price-row"><strong>{fcfa(price)}</strong>{isPromo(p) && <s>{fcfa(p.price)}</s>}</div>
        <span className={out ? "badge off" : "badge ok"}>{out ? "Indisponible" : "Disponible"}</span>
        <AddToCart id={p._id} name={p.name} price={price} image={img} section={p.section} available={!out} />
      </div>
    </article>
  );
}
