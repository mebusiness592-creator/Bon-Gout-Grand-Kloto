import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { ResourceManager, type Field } from "@/components/ResourceManager";
import { SECTION_LABEL } from "@/lib/labels";
export const metadata = { title: "Catégories" };

export default async function Page() {
  await requireStaff();
  const items = await (await getDb()).collection("categories").find().sort({ section: 1, order: 1 }).toArray();
  const fields: Field[] = [
    { name: "name", label: "Nom de la catégorie", type: "text", required: true },
    { name: "section", label: "Rubrique", type: "select", required: true, options: [{ value: "restaurant", label: "Restaurant" }, { value: "huile", label: "Production locale" }] },
    { name: "order", label: "Ordre d'affichage (0 = en premier)", type: "number", required: true },
  ];
  return <ResourceManager resource="categories" title="Catégories" noun="catégorie" items={plain(items)} fields={fields} defaults={{ section: "restaurant", order: 0 }}
    cols={[{ key: "name", label: "Nom" }, { key: "section", label: "Rubrique", type: "map" }, { key: "order", label: "Ordre" }]} maps={{ section: SECTION_LABEL }} />;
}
