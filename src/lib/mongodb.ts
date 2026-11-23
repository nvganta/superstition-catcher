import { MongoClient, Db } from 'mongodb';
import { DB_NAME, MONGO_CLIENT_OPTIONS } from '@/lib/db/safeMongo';

let clientPromise: Promise<MongoClient> | null = null;

export function getClient(): Promise<MongoClient> {
  clientPromise ??= new MongoClient(process.env.MONGODB_URI!, MONGO_CLIENT_OPTIONS)
    .connect()
    .catch((error) => {
      clientPromise = null;
      throw error;
    });
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  return (await getClient()).db(DB_NAME);
}
