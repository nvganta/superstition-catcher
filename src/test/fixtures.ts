import type { Db } from 'mongodb';
import { postCommunityEntry } from '@/lib/entries/community';

/** A migrated, curated entry present whenever startTestMongo runs with migrate: true. */
export const CURATED_ENTRY = 'lemons-chillies-door';

export async function postTestEntry(db: Db, overrides: Record<string, unknown> = {}): Promise<string> {
  const result = await postCommunityEntry(db, {
    visitorId: crypto.randomUUID(),
    title: `Never sweep after sunset ${crypto.randomUUID().slice(0, 8)}`,
    country: 'India',
    region: 'india',
    categorySlugs: ['home'],
    theDefault: 'Sweeping after dark sweeps the household luck out of the door.',
    whyItStarted: 'Homes were lit by oil lamps, so small valuables were easy to lose in the dark.',
    whyItStuck: 'Elders repeated it as a rule about respect for the evening lamp.',
    whatsChangedSince: 'With electric light most families sweep whenever they like.',
    ...overrides,
  });
  if (result.kind !== 'created') {
    throw new Error(`postTestEntry: ${JSON.stringify(result)}`);
  }
  return result.entry.id;
}
