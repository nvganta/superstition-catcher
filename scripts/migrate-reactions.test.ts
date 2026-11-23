import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startTestMongo, type TestMongo } from '../src/test/mongoServer';
import { CURATED_ENTRY } from '../src/test/fixtures';
import { createReactionStore } from '../src/lib/reactions/store';
import { ensureIndexes } from './ensure-indexes';
import { LEGACY_ARCHIVE, migrateReactions } from './migrate-reactions';

let mongo: TestMongo;
const now = new Date('2026-11-23T12:00:00Z');
const visitor = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const at = new Date('2026-05-01T08:00:00Z');

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
});

beforeEach(async () => {
  await mongo.reset();
  await mongo.db.collection('reactions').drop();
  await mongo.db.collection('reactions').insertMany([
    { superstitionId: CURATED_ENTRY, type: 'mind_blown', visitorId: visitor, createdAt: at },
    { superstitionId: 'black-cat-india', type: 'dislike', visitorId: visitor, createdAt: at },
    { superstitionId: CURATED_ENTRY, type: 'like', visitorId: other, createdAt: at },
    { superstitionId: 'deleted-long-ago', type: 'like', visitorId: other, createdAt: at },
    { superstitionId: CURATED_ENTRY, type: 'like', visitorId: 'not-a-uuid', createdAt: at },
  ]);
});

afterAll(async () => {
  await mongo.stop();
});

async function newModel() {
  return mongo.db
    .collection('reactions')
    .find({}, { projection: { _id: 0 } })
    .sort({ visitorId: 1, entryId: 1 })
    .toArray();
}

describe('migrate-reactions', () => {
  it('reports the plan on a dry run and writes nothing', async () => {
    const report = await migrateReactions(mongo.db, { dryRun: true, now });

    expect(report).toEqual({ dryRun: true, legacyFound: 5, ratingsCreated: 3, alreadyRated: 0, orphaned: 1, invalid: 1 });
    expect(await mongo.db.collection('reactions').countDocuments({ superstitionId: { $exists: true } })).toBe(5);
    expect(await mongo.db.collection(LEGACY_ARCHIVE).countDocuments()).toBe(0);
  });

  it('turns emoji reactions into ratings and archives every original', async () => {
    const blackCat = await mongo.db.collection('entries').findOne({ id: 'black-cat-india' });
    expect(blackCat).not.toBeNull();

    await migrateReactions(mongo.db, { now });

    expect(await newModel()).toEqual([
      { entryId: 'black-cat-india', visitorId: visitor, kind: 'rate', value: 2, legacyType: 'dislike', createdAt: at, updatedAt: at },
      { entryId: CURATED_ENTRY, visitorId: visitor, kind: 'rate', value: 5, legacyType: 'mind_blown', createdAt: at, updatedAt: at },
      { entryId: CURATED_ENTRY, visitorId: other, kind: 'rate', value: 4, legacyType: 'like', createdAt: at, updatedAt: at },
    ]);
    expect(await mongo.db.collection(LEGACY_ARCHIVE).countDocuments()).toBe(5);
    expect((await createReactionStore(mongo.db).view(CURATED_ENTRY, visitor))!.rating).toEqual({ average: 4.5, count: 2 });
  });

  it('changes nothing when run again', async () => {
    await migrateReactions(mongo.db, { now });
    const reactions = await newModel();
    const archived = await mongo.db.collection(LEGACY_ARCHIVE).find().toArray();

    const second = await migrateReactions(mongo.db, { now: new Date('2026-11-24T00:00:00Z') });

    expect(second).toMatchObject({ legacyFound: 0, ratingsCreated: 0 });
    expect(await newModel()).toEqual(reactions);
    expect(await mongo.db.collection(LEGACY_ARCHIVE).find().toArray()).toEqual(archived);
  });

  it('finishes a run that stopped after archiving and keeps a newer rating', async () => {
    const [legacy] = await mongo.db.collection('reactions').find({ visitorId: visitor, superstitionId: CURATED_ENTRY }).toArray();
    await mongo.db.collection(LEGACY_ARCHIVE).insertOne({ ...legacy, archivedAt: now });
    await mongo.db.collection('reactions').insertOne({ entryId: CURATED_ENTRY, visitorId: visitor, kind: 'rate', value: 1, createdAt: now, updatedAt: now });

    const report = await migrateReactions(mongo.db, { now });

    expect(report).toMatchObject({ ratingsCreated: 2, alreadyRated: 1 });
    expect(await mongo.db.collection('reactions').findOne({ entryId: CURATED_ENTRY, visitorId: visitor })).toMatchObject({ value: 1 });
    expect(await mongo.db.collection(LEGACY_ARCHIVE).countDocuments()).toBe(5);
  });

  it('leaves the collection ready for the unique reactions index', async () => {
    await expect(ensureIndexes(mongo.db)).rejects.toMatchObject({ code: 11000 });

    await migrateReactions(mongo.db, { now });

    await expect(ensureIndexes(mongo.db)).resolves.toBeUndefined();
  });
});
