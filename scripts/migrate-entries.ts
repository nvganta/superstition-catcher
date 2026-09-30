import { MongoClient } from 'mongodb';
import { superstitions, type Superstition } from '../src/data/superstitions';
import { assertSafeMongoUri, DB_NAME } from '../src/lib/db/safeMongo';
import { entrySchema } from '../src/lib/schema/entry';
import { entryVersionSchema } from '../src/lib/schema/entryVersion';
import {
  entryToVersionSnapshot,
  mapSuperstitionToEntry,
  type MigrationEditorialFlag,
} from '../src/lib/migration/mapSuperstitionToEntry';

export interface MigrationReport {
  dryRun: boolean;
  sourceCount: number;
  dbOnlyCount: number;
  mergedCount: number;
  upserted: number;
  versionsWritten: number;
  editorialFlags: MigrationEditorialFlag[];
}

function mergeSuperstitionSources(
  staticEntries: Superstition[],
  dbEntries: Superstition[]
): Superstition[] {
  const byId = new Map<string, Superstition>();

  for (const entry of staticEntries) {
    byId.set(entry.id, entry);
  }

  for (const entry of dbEntries) {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  }

  return [...byId.values()];
}

export async function migrateEntries(
  db: ReturnType<MongoClient['db']>,
  options: { dryRun?: boolean } = {}
): Promise<MigrationReport> {
  const dryRun = options.dryRun ?? false;
  const superstitionsCollection = db.collection('superstitions');
  const entriesCollection = db.collection('entries');
  const versionsCollection = db.collection('entryVersions');

  const dbDocs = (await superstitionsCollection.find({}).toArray()) as unknown as Array<
    Superstition & { createdAt?: Date; updatedAt?: Date }
  >;

  const merged = mergeSuperstitionSources(superstitions, dbDocs);
  const editorialFlags: MigrationEditorialFlag[] = [];
  let upserted = 0;
  let versionsWritten = 0;

  for (const source of merged) {
    const dbMatch = dbDocs.find((doc) => doc.id === source.id);
    const { entry: mapped, editorialFlag } = mapSuperstitionToEntry(source, {
      createdAt: dbMatch?.createdAt,
      updatedAt: dbMatch?.updatedAt,
    });

    if (editorialFlag) {
      editorialFlags.push(editorialFlag);
    }

    const parsedEntry = entrySchema.parse(mapped);

    if (!dryRun) {
      const result = await entriesCollection.updateOne(
        { id: parsedEntry.id },
        { $set: parsedEntry },
        { upsert: true }
      );

      if (result.upsertedCount > 0 || result.modifiedCount > 0) {
        upserted += 1;
      }

      const versionDoc = entryVersionSchema.parse({
        entryId: parsedEntry.id,
        version: parsedEntry.version,
        snapshot: entryToVersionSnapshot(mapped),
        createdAt: parsedEntry.updatedAt,
      });

      const versionResult = await versionsCollection.updateOne(
        { entryId: versionDoc.entryId, version: versionDoc.version },
        { $set: versionDoc },
        { upsert: true }
      );

      if (versionResult.upsertedCount > 0 || versionResult.modifiedCount > 0) {
        versionsWritten += 1;
      }
    } else {
      upserted += 1;
      versionsWritten += 1;
    }
  }

  return {
    dryRun,
    sourceCount: superstitions.length,
    dbOnlyCount: dbDocs.filter((doc) => !superstitions.some((s) => s.id === doc.id)).length,
    mergedCount: merged.length,
    upserted,
    versionsWritten,
    editorialFlags,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGODB_URI;
  assertSafeMongoUri(uri, 'migrate-entries');

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const report = await migrateEntries(db, { dryRun });
    console.log(JSON.stringify(report, null, 2));
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
