import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI manquant dans les variables d'environnement.");

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
const client = new MongoClient(uri);
const clientPromise = global._mongoClientPromise ?? client.connect();
if (process.env.NODE_ENV !== "production") global._mongoClientPromise = clientPromise;

export async function getDb(): Promise<Db> {
  const connected = await clientPromise;
  return connected.db(process.env.MONGODB_DB || "bon_gout_grand_kloto");
}
