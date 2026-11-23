import { MongoClient, type Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ensureIndexes } from '../../scripts/ensure-indexes';
import { migrateEntries } from '../../scripts/migrate-entries';
import { seedCategories } from '@/lib/categories/seedCategories';
import { DB_NAME, MONGO_CLIENT_OPTIONS } from '@/lib/db/safeMongo';

export interface TestMongo {
  db: Db;
  uri: string;
  reset: () => Promise<void>;
  stop: () => Promise<void>;
}

/** A real, disposable mongod so $text, aggregation and unique indexes behave as in production. */
export async function startTestMongo(options: { migrate?: boolean } = {}): Promise<TestMongo> {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();
  const client = await MongoClient.connect(uri, MONGO_CLIENT_OPTIONS);
  const db = client.db(DB_NAME);

  async function reset() {
    await db.dropDatabase();
    await ensureIndexes(db);
    await seedCategories(db);
    if (options.migrate) {
      await migrateEntries(db);
    }
  }

  await reset();

  return {
    db,
    uri,
    reset,
    stop: async () => {
      await client.close();
      await server.stop();
    },
  };
}
