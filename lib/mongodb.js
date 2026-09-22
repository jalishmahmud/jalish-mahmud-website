import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let clientPromise;

export function isDatabaseConfigured() {
  return Boolean(uri);
}

export async function getDatabase() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || undefined);
}
