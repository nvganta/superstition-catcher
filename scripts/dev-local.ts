import { spawn } from 'node:child_process';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedCategories } from '../src/lib/categories/seedCategories';
import { DB_NAME, MONGO_CLIENT_OPTIONS } from '../src/lib/db/safeMongo';
import { ensureIndexes } from './ensure-indexes';
import { migrateEntries } from './migrate-entries';

const LOCAL_ADMIN_PASSWORD = 'local-admin';

async function prepareDatabase(uri: string) {
  const client = await MongoClient.connect(uri, MONGO_CLIENT_OPTIONS);
  try {
    const db = client.db(DB_NAME);
    await ensureIndexes(db);
    const categories = await seedCategories(db);
    const report = await migrateEntries(db);
    console.log(
      `dev:local: ${categories.upserted} categories, ${report.upserted} entries migrated into ${uri}${DB_NAME}`
    );
  } finally {
    await client.close();
  }
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await prepareDatabase(uri);

  const adminPassword = process.env.ADMIN_PASSWORD || LOCAL_ADMIN_PASSWORD;
  console.log(
    process.env.ADMIN_PASSWORD
      ? 'dev:local: using ADMIN_PASSWORD from your environment. Data is discarded on exit.'
      : `dev:local: admin password is "${LOCAL_ADMIN_PASSWORD}". Data is discarded on exit.`
  );

  const next = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, MONGODB_URI: uri, ADMIN_PASSWORD: adminPassword },
  });

  let stopping = false;
  async function stop(code: number) {
    if (stopping) return;
    stopping = true;
    next.kill();
    await mongod.stop();
    process.exit(code);
  }

  next.on('exit', (code) => stop(code ?? 0));
  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
