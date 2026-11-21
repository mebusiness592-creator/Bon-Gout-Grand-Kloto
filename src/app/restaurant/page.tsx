import SiteHeader from "@/components/SiteHeader";
import ProductGrid from "@/components/ProductGrid";
import { getDb } from "@/lib/db";
import type { Product } from "@/lib/types";
export const dynamic="force-dynamic";
export default async function Restaurant(){const db=await getDb();const products=await db.collection<Product>("products").find({section:"restaurant",available:true}).sort({createdAt:-1}).toArray();return <><SiteHeader/><main className="container section"><div className="eyebrow">Restaurant Bon Goût</div><h1 className="serif" style={{fontSize:44,color:"var(--forest)"}}>Nos spécialités</h1><p className="muted" style={{maxWidth:620,lineHeight:1.8}}>Choisissez vos plats préférés et faites-vous livrer. Les menus et photos sont mis à jour par notre équipe.</p><ProductGrid products={JSON.parse(JSON.stringify(products))}/></main></>}
