import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { DishManager } from "@/components/DishManager";
import type { Product } from "@/lib/types";
export const metadata = { title: "Gestion du restaurant" };

export default async function Page() {
  await requireStaff();
  const db = await getDb();
  const [items, cats] = await Promise.all([
    db.collection("products").find({ section: "restaurant" }).sort({ createdAt: -1 }).toArray(),
    db.collection("categories").find({ section: "restaurant" }).sort({ order: 1 }).toArray(),
  ]);
  return <DishManager items={plain<Product[]>(items)} categories={plain<{ _id: string; name: string }[]>(cats)} />;
}