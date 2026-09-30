import { MongoClient } from 'mongodb';
import { seedCategories } from '../src/lib/categories/seedCategories';
import { assertSafeMongoUri, DB_NAME } from '../src/lib/db/safeMongo';

async function main() {
  const uri = process.env.MONGODB_URI;
  assertSafeMongoUri(uri, 'seed-categories');

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const result = await seedCategories(db);
    console.log(`Categories seeded (${result.upserted} new).`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
