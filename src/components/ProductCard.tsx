import Link from "next/link";
import type { Product } from "@/lib/types";
import { effectivePrice, isPromo, isRange, priceLabel, fcfa, productImage } from "@/lib/pricing";
import { AddToCart } from "./AddToCart";
import { groupsOf } from "@/lib/options";
import { Slides } from "./Slides";

export function ProductCard({ p, slideshow = false }: { p: Product; slideshow?: boolean }) {
  const img = productImage(p);
  // Sur l'accueil : les images (et vidéos, muettes) du plat défilent automatiquement toutes les 4,5 s.
  const media = slideshow ? [...(p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : []), ...(p.videos || [])] : [];
  const animate = media.length > 1 || (media.length === 1 && /\.(mp4|webm|mov)(\?.*)?$/i.test(media[0]));
  const href = (p.section === "restaurant" ? "/menu/" : "/produits/") + p._id;
  const out = !p.available || (typeof p.stock === "number" && p.stock <= 0);
  const hasVariants = groupsOf(p).some((g) => g.role === "variant" && g.items.length > 0);
  const needsChoice = isRange(p) || groupsOf(p).length > 0;
  return (
    <article className="card">
      {animate ? (
        <div className="card-img">
          <Slides images={media} />
          <Link href={href} className="card-link" aria-label={p.name} />
          {isPromo(p) && <span className="badge promo">Promo</span>}
        </div>
      ) : (
        <Link href={href} className="card-img" aria-label={p.name}>
          {img ? <img src={img} alt={p.name} loading="lazy" /> : <div className="ph">{p.section === "restaurant" ? "🍛" : "🌴"}</div>}
          {isPromo(p) && <span className="badge promo">Promo</span>}
        </Link>
      )}
      <div className="card-body">
        <h3><Link href={href}>{p.name}</Link></h3>
        {p.format && <span className="pill">{p.format}</span>}
        {p.description && <p className="muted clamp">{p.description}</p>}
        <div className="price-row"><strong>{hasVariants ? "Prix selon variante" : priceLabel(p)}</strong>{!hasVariants && isPromo(p) && <s>{fcfa(p.price)}</s>}</div>
        <span className={out ? "badge off" : "badge ok"}>{out ? "Indisponible" : "Disponible"}</span>
        {out ? <AddToCart id={p._id} name={p.name} price={effectivePrice(p)} section={p.section} available={false} />
          : needsChoice ? <Link href={href} className="btn btn-primary">Choisir &amp; commander</Link>
          : <AddToCart id={p._id} name={p.name} price={effectivePrice(p)} image={img} section={p.section} available />}
      </div>
    </article>
  );
}
