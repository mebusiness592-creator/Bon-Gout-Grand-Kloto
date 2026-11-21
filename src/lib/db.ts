import { MongoClient, Db, ObjectId } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI manquant dans les variables d'environnement.");
  if (!global._mongoClientPromise) global._mongoClientPromise = new MongoClient(uri).connect();
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await clientPromise();
  return c.db(process.env.MONGODB_DB || "bon_gout_grand_kloto");
}

/** Convertit un identifiant texte en ObjectId, ou null s'il est invalide. */
export function oid(id: unknown): ObjectId | null {
  return typeof id === "string" && ObjectId.isValid(id) && id.length === 24 ? new ObjectId(id) : null;
}

/** Convertit un document MongoDB (ObjectId, Date) en objet simple transmissible aux composants client. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plain<T = any>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc));
}
