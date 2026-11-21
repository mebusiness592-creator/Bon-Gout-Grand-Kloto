import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog";
import { AddToCart } from "@/components/AddToCart";
import { effectivePrice, fcfa, isPromo, productImage } from "@/lib/pricing";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProduct((await params).id);
  return { title: p?.name || "Plat" };
}
export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProduct((await params).id);
  if (!p) notFound();
  const imgs = p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : [];
  const out = !p.available || (typeof p.stock === "number" && p.stock <= 0);
  const back = p.section === "restaurant" ? "/menu" : "/produits";
  return (
    <div className="container section">
      <Link href={back} className="muted">← Retour</Link>
      <div className="split" style={{ marginTop: "1rem", alignItems: "start" }}>
        <div><div className="detail-img">{imgs[0] ? <img src={imgs[0]} alt={p.name} /> : <div className="ph">{p.section === "restaurant" ? "🍛" : "🌴"}</div>}</div>
          {imgs.length > 1 && <div className="thumbs">{imgs.slice(1).map((u) => <img key={u} src={u} alt="" loading="lazy" />)}</div>}</div>
        <div>
          <h1>{p.name}</h1>
          {p.format && <span className="pill">{p.format}</span>}
          <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>
          <div className="price-row" style={{ margin: "1rem 0" }}><strong style={{ fontSize: "1.6rem" }}>{fcfa(effectivePrice(p))}</strong>{isPromo(p) && <s>{fcfa(p.price)}</s>}</div>
          <span className={out ? "badge off" : "badge ok"}>{out ? "Indisponible" : "Disponible"}</span>
          <div style={{ marginTop: "1.2rem" }}><AddToCart withQty id={p._id} name={p.name} price={effectivePrice(p)} image={productImage(p)} section={p.section} available={!out} /></div>
        </div>
      </div>
    </div>
  );
}
