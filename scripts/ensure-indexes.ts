import { MongoClient } from 'mongodb';
import { assertSafeMongoUri, DB_NAME } from '../src/lib/db/safeMongo';

export async function ensureIndexes(db: ReturnType<MongoClient['db']>) {
  await db.collection('entries').createIndex({ id: 1 }, { unique: true, name: 'entries_id_unique' });
  await db.collection('entries').createIndex({ categorySlugs: 1 }, { name: 'entries_categorySlugs' });
  await db.collection('entries').createIndex({ status: 1 }, { name: 'entries_status' });

  await db
    .collection('entryVersions')
    .createIndex({ entryId: 1, version: 1 }, { unique: true, name: 'entryVersions_entryId_version_unique' });

  await db.collection('categories').createIndex({ slug: 1 }, { unique: true, name: 'categories_slug_unique' });

  await db.collection('flags').createIndex(
    { targetType: 1, targetId: 1, visitorId: 1 },
    { unique: true, name: 'flags_target_visitor_unique' }
  );
  await db.collection('flags').createIndex({ entryId: 1 }, { name: 'flags_entryId' });

  await db.collection('reactions').createIndex(
    { entryId: 1, visitorId: 1, kind: 1 },
    { unique: true, name: 'reactions_entry_visitor_kind_unique' }
  );

  await db.collection('chainEntries').createIndex(
    { entryId: 1, visitorId: 1 },
    { unique: true, name: 'chainEntries_entry_visitor_unique' }
  );
  await db.collection('chainEntries').createIndex({ status: 1 }, { name: 'chainEntries_status' });

  await db.collection('aiNotes').createIndex({ entryId: 1 }, { name: 'aiNotes_entryId' });

  await db.collection('rateLimits').createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: 'rateLimits_expiresAt_ttl' }
  );
  await db.collection('rateLimits').createIndex(
    { visitorId: 1, action: 1, windowStart: 1 },
    { name: 'rateLimits_visitor_action_window' }
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;
  assertSafeMongoUri(uri, 'ensure-indexes');

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    await ensureIndexes(db);
    console.log('Indexes ensured successfully.');
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
