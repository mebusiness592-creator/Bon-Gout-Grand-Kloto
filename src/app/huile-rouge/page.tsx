import SiteHeader from "@/components/SiteHeader";
import ProductGrid from "@/components/ProductGrid";
import { getDb } from "@/lib/db";
import type { Product } from "@/lib/types";
export const dynamic="force-dynamic";
export default async function Huile(){const db=await getDb();const products=await db.collection<Product>("products").find({section:"huile",available:true}).sort({createdAt:-1}).toArray();return <><SiteHeader/><main className="container section"><div className="eyebrow">Production locale</div><h1 className="serif" style={{fontSize:44,color:"var(--forest)"}}>Notre huile rouge</h1><p className="muted" style={{maxWidth:650,lineHeight:1.8}}>Une huile rouge issue du palmier à huile. Consultez les formats disponibles et passez votre commande simplement.</p><ProductGrid products={JSON.parse(JSON.stringify(products))}/></main></>}
