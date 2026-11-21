import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
export default function ProductGrid({products}:{products:Product[]}){if(!products.length)return <div className="card" style={{padding:28,textAlign:"center",gridColumn:"1/-1"}}><h3>Aucun produit publié pour le moment</h3><p className="muted">Nos nouveautés seront bientôt disponibles.</p></div>;return <div className="grid-products">{products.map((p,i)=><ProductCard key={p._id||i} product={p}/>)}</div>}
