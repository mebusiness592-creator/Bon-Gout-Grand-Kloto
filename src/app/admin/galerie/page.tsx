import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { ResourceManager, type Field } from "@/components/ResourceManager";
import { PLACEMENTS } from "@/lib/labels";
export const metadata = { title: "Galerie et médias" };

export default async function Page() {
  await requireStaff();
  const items = await (await getDb()).collection("media").find().sort({ createdAt: -1 }).toArray();
  const fields: Field[] = [
    { name: "url", label: "Photo ou vidéo", type: "media" },
    { name: "placement", label: "Emplacement sur le site", type: "select", required: true, options: Object.entries(PLACEMENTS).map(([value, label]) => ({ value, label })) },
    { name: "title", label: "Titre / légende", type: "text" },
  ];
  return <ResourceManager resource="media" title="Galerie et médias" noun="média" items={plain(items)} fields={fields} defaults={{ placement: "galerie", kind: "image" }}
    cols={[{ key: "url", label: "Aperçu", type: "media" }, { key: "title", label: "Titre" }, { key: "placement", label: "Emplacement", type: "map" }]} maps={{ placement: PLACEMENTS }} />;
}
