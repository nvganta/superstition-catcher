import { MongoClient, type Collection } from 'mongodb';
import { assertSafeMongoUri, DB_NAME, MONGO_CLIENT_OPTIONS } from '../src/lib/db/safeMongo';

const NAMESPACE_NOT_FOUND = 26;
const INDEX_NOT_FOUND = 27;

/** Replaced indexes are dropped by name, so a rerun on an already-updated database is a no-op. */
async function dropIndexIfPresent(collection: Collection, name: string) {
  try {
    await collection.dropIndex(name);
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== NAMESPACE_NOT_FOUND && code !== INDEX_NOT_FOUND) throw error;
  }
}

export async function ensureIndexes(db: ReturnType<MongoClient['db']>) {
  await db.collection('entries').createIndex({ id: 1 }, { unique: true, name: 'entries_id_unique' });
  await db.collection('entries').createIndex({ categorySlugs: 1 }, { name: 'entries_categorySlugs' });
  await db.collection('entries').createIndex({ status: 1 }, { name: 'entries_status' });
  await db
    .collection('entries')
    .createIndex({ status: 1, createdAt: -1 }, { name: 'entries_status_createdAt' });
  await db
    .collection('entries')
    .createIndex({ postedByVisitorId: 1, createdAt: -1 }, { name: 'entries_postedByVisitorId_createdAt' });
  await db.collection('entries').createIndex(
    {
      title: 'text',
      tags: 'text',
      country: 'text',
      theDefault: 'text',
      whyItStarted: 'text',
      whyItStuck: 'text',
      whatsChangedSince: 'text',
      freshLook: 'text',
    },
    {
      name: 'entries_text',
      weights: { title: 10, tags: 5, country: 5, theDefault: 3 },
    }
  );

  await db
    .collection('entryVersions')
    .createIndex({ entryId: 1, version: 1 }, { unique: true, name: 'entryVersions_entryId_version_unique' });

  await db.collection('categories').createIndex({ slug: 1 }, { unique: true, name: 'categories_slug_unique' });

  await dropIndexIfPresent(db.collection('flags'), 'flags_target_visitor_unique');
  await db.collection('flags').createIndex(
    { targetType: 1, targetId: 1, visitorId: 1, resolvedAt: 1 },
    { unique: true, name: 'flags_target_visitor_open_unique' }
  );
  await db.collection('flags').createIndex({ entryId: 1 }, { name: 'flags_entryId' });

  await db.collection('statusTransitions').createIndex(
    { targetType: 1, targetId: 1, at: -1 },
    { name: 'statusTransitions_target_at' }
  );
  await db.collection('statusTransitions').createIndex({ actor: 1, at: -1 }, { name: 'statusTransitions_actor_at' });

  await db.collection('reactions').createIndex(
    { entryId: 1, visitorId: 1, kind: 1 },
    { unique: true, name: 'reactions_entry_visitor_kind_unique' }
  );
  await db.collection('reactions').createIndex({ visitorId: 1, kind: 1 }, { name: 'reactions_visitor_kind' });

  await db.collection('chainEntries').createIndex(
    { entryId: 1, visitorId: 1 },
    { unique: true, name: 'chainEntries_entry_visitor_unique' }
  );
  await db.collection('chainEntries').createIndex({ status: 1 }, { name: 'chainEntries_status' });

  await db.collection('aiNotes').createIndex({ entryId: 1 }, { name: 'aiNotes_entryId' });
  await db.collection('aiNotes').createIndex(
    { entryId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'published' }, name: 'aiNotes_one_published_per_entry' }
  );
  await db.collection('aiNotes').createIndex({ status: 1, createdAt: -1 }, { name: 'aiNotes_status_createdAt' });

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

  const client = new MongoClient(uri, MONGO_CLIENT_OPTIONS);
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
