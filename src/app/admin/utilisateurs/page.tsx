import { requireStaff } from "@/lib/adminPage";
import { getDb, plain } from "@/lib/db";
import { UsersManager } from "@/components/UsersManager";
export const metadata = { title: "Utilisateurs et rôles" };
export default async function Page() {
  const me = await requireStaff(true);
  const users = await (await getDb()).collection("users").find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
  return <UsersManager users={plain(users)} meId={me.id} />;
}
