import {NextRequest,NextResponse} from "next/server";
import {getDb} from "@/lib/db";
import {z} from "zod";
import {randomBytes} from "crypto";
import {ObjectId} from "mongodb";

const schema=z.object({
 customerName:z.string().min(2).max(100),
 phone:z.string().min(6).max(30),
 address:z.string().min(4).max(500),
 section:z.enum(["restaurant","huile"]),
 paymentMethod:z.enum(["ussd","delivery"]),
 operator:z.enum(["TMoney","Flooz"]).optional(),
 location:z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),accuracy:z.number().optional()}).nullable().optional(),
 items:z.array(z.object({productId:z.string().min(1),quantity:z.number().int().min(1).max(30)})).min(1).max(30)
});
export async function POST(req:NextRequest){
 try{
  const parsed=schema.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:"Informations de commande invalides."},{status:400});
  const data=parsed.data;
  if(data.paymentMethod==="ussd"&&!data.operator)return NextResponse.json({error:"Choisissez votre opérateur mobile money."},{status:400});
  const db=await getDb();
  const ids=data.items.map(x=>x.productId);
  if(ids.some(id=>!ObjectId.isValid(id)))return NextResponse.json({error:"Produit invalide."},{status:400});
  const products=await db.collection("products").find({_id:{$in:ids.map(id=>new ObjectId(id))},section:data.section,available:true}).toArray();
  if(products.length!==new Set(ids).size)return NextResponse.json({error:"Un produit n'est plus disponible. Actualisez votre panier."},{status:400});
  const productMap=new Map(products.map(p=>[p._id.toString(),p]));
  const items=data.items.map(item=>{const p=productMap.get(item.productId)!;return {productId:item.productId,name:p.name,quantity:item.quantity,unitPrice:Number(p.price)};});
  const total=items.reduce((sum,item)=>sum+item.quantity*item.unitPrice,0);
  const order={customerName:data.customerName,phone:data.phone,address:data.address,section:data.section,paymentMethod:data.paymentMethod,operator:data.operator,location:data.location||null,items,total,reference:"BG-"+randomBytes(4).toString("hex").toUpperCase(),status:"pending",paymentStatus:data.paymentMethod==="ussd"?"pending":"unpaid",createdAt:new Date().toISOString()};
  const result=await db.collection("orders").insertOne(order);
  await db.collection("notifications").insertOne({title:"Nouvelle commande",message:`Commande ${order.reference} reçue`,orderId:result.insertedId.toString(),read:false,createdAt:new Date().toISOString()});
  return NextResponse.json({id:result.insertedId.toString(),reference:order.reference});
 }catch{return NextResponse.json({error:"Impossible d'enregistrer la commande."},{status:500});}
}
