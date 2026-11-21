 "use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { Product, Section } from "@/lib/types";
type CartItem = { product: Product; quantity: number };
type CartCtx = { items: CartItem[]; add: (p: Product) => void; remove: (id: string) => void; clear: () => void; total: number; section: Section | null };
const Ctx = createContext<CartCtx | null>(null);
export function CartProvider({children}:{children:React.ReactNode}) {
 const [items,setItems]=useState<CartItem[]>([]);
 const add=(p:Product)=>setItems(old=>{const id=p._id||p.name;const found=old.find(x=>(x.product._id||x.product.name)===id);return found?old.map(x=>(x.product._id||x.product.name)===id?{...x,quantity:x.quantity+1}:x):[...old,{product:p,quantity:1}]});
 const remove=(id:string)=>setItems(old=>old.filter(x=>(x.product._id||x.product.name)!==id));
 const sections=new Set(items.map(x=>x.product.section));
 const value=useMemo(()=>({items,add,remove,clear:()=>setItems([]),total:items.reduce((s,x)=>s+x.product.price*x.quantity,0),section:sections.size===1?(items[0]?.product.section||null):null}),[items]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useCart(){const v=useContext(Ctx);if(!v)throw new Error("CartProvider manquant");return v;}
