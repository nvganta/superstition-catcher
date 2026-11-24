import type { Db, Document } from 'mongodb';
import type { EntryStatus } from '@/lib/schema/common';
import { chainEntrySchema } from '@/lib/schema/chainEntry';
import type { FlagReason, FlagTargetType } from '@/lib/schema/flag';
import { flagSchema } from '@/lib/schema/flag';
import { entrySchema } from '@/lib/schema/entry';
import { statusTransitionSchema, type StatusEvent, type StatusTransition } from '@/lib/schema/statusTransition';
import { adminEvents } from './statusMachine';

export interface QueueFlag {
  reason: FlagReason;
  note?: string;
  createdAt: Date;
}

/** One target as an admin sees it. Never carries a visitor id. */
export interface ModerationItem {
  targetType: FlagTargetType;
  targetId: string;
  entryId: string;
  entryTitle: string;
  status: EntryStatus;
  text: string;
  author?: string;
  openFlags: QueueFlag[];
  events: StatusEvent[];
  lastTransition?: Pick<StatusTransition, 'event' | 'from' | 'to' | 'actor' | 'at'>;
}

const QUEUED_STATUSES: EntryStatus[] = ['flagged', 'underReview', 'hidden'];
const STATUS_ORDER: Record<EntryStatus, number> = { flagged: 0, underReview: 1, live: 2, hidden: 3, removed: 4 };
const RECENT_STORIES = 100;

function key(targetType: FlagTargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

async function openFlagsByTarget(db: Db): Promise<Map<string, QueueFlag[]>> {
  const docs = await db
    .collection('flags')
    .find({ resolvedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .toArray();
  const byTarget = new Map<string, QueueFlag[]>();
  for (const doc of docs) {
    const parsed = flagSchema.safeParse(doc);
    if (!parsed.success) continue;
    const { targetType, targetId, reason, note, createdAt } = parsed.data;
    const flags = byTarget.get(key(targetType, targetId)) ?? [];
    flags.push({ reason, note, createdAt });
    byTarget.set(key(targetType, targetId), flags);
  }
  return byTarget;
}

async function lastTransitions(db: Db, items: Omit<ModerationItem, 'lastTransition'>[]) {
  if (items.length === 0) return new Map<string, ModerationItem['lastTransition']>();
  const docs = await db
    .collection('statusTransitions')
    .find({ $or: items.map(({ targetType, targetId }) => ({ targetType, targetId })) })
    .sort({ at: -1 })
    .toArray();
  const latest = new Map<string, ModerationItem['lastTransition']>();
  for (const doc of docs) {
    const parsed = statusTransitionSchema.safeParse(doc);
    if (!parsed.success) continue;
    const { targetType, targetId, event, from, to, actor, at } = parsed.data;
    if (!latest.has(key(targetType, targetId))) latest.set(key(targetType, targetId), { event, from, to, actor, at });
  }
  return latest;
}

async function entryTitles(db: Db, ids: string[]): Promise<Map<string, string>> {
  const docs = await db
    .collection('entries')
    .find({ id: { $in: ids } }, { projection: { id: 1, title: 1 } })
    .toArray();
  return new Map(docs.map((doc) => [String(doc.id), String(doc.title)]));
}

function idsOf(flags: Map<string, QueueFlag[]>, targetType: FlagTargetType): string[] {
  const prefix = `${targetType}:`;
  return [...flags.keys()].filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
}

async function buildItems(
  db: Db,
  entryDocs: Document[],
  chainDocs: Document[],
  flags: Map<string, QueueFlag[]>
): Promise<ModerationItem[]> {
  const entries = entryDocs.flatMap((doc) => {
    const parsed = entrySchema.safeParse(doc);
    return parsed.success ? [parsed.data] : [];
  });
  const stories = chainDocs.flatMap((doc) => {
    const parsed = chainEntrySchema.safeParse(doc);
    return parsed.success && parsed.data.story ? [{ ...parsed.data, story: parsed.data.story }] : [];
  });
  const titles = await entryTitles(db, [...new Set(stories.map((story) => story.entryId))]);

  const items: Omit<ModerationItem, 'lastTransition'>[] = [
    ...entries.map((entry) => ({
      targetType: 'entry' as const,
      targetId: entry.id,
      entryId: entry.id,
      entryTitle: entry.title,
      status: entry.status,
      text: entry.theDefault,
      author: entry.origin === 'curated' ? 'Editors' : entry.postedBy,
      openFlags: flags.get(key('entry', entry.id)) ?? [],
      events: adminEvents(entry.status, flags.has(key('entry', entry.id))),
    })),
    ...stories.map((chain) => ({
      targetType: 'chainEntry' as const,
      targetId: chain.id,
      entryId: chain.entryId,
      entryTitle: titles.get(chain.entryId) ?? chain.entryId,
      status: chain.status,
      text: chain.story.text,
      author: chain.story.name,
      openFlags: flags.get(key('chainEntry', chain.id)) ?? [],
      events: adminEvents(chain.status, flags.has(key('chainEntry', chain.id))),
    })),
  ];

  const latest = await lastTransitions(db, items);
  return items.map((item) => ({ ...item, lastTransition: latest.get(key(item.targetType, item.targetId)) }));
}

/** Everything awaiting a moderator: open flags grouped by target, plus anything flagged, under review or hidden. */
export async function listModerationQueue(db: Db): Promise<ModerationItem[]> {
  const flags = await openFlagsByTarget(db);
  const [entryDocs, chainDocs] = await Promise.all([
    db
      .collection('entries')
      .find({ $or: [{ status: { $in: QUEUED_STATUSES } }, { id: { $in: idsOf(flags, 'entry') } }] })
      .toArray(),
    db
      .collection('chainEntries')
      .find({ $or: [{ status: { $in: QUEUED_STATUSES } }, { id: { $in: idsOf(flags, 'chainEntry') } }] })
      .toArray(),
  ]);
  const items = await buildItems(db, entryDocs, chainDocs, flags);
  return items
    .filter((item) => item.status !== 'removed')
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.openFlags.length - a.openFlags.length);
}

/** The latest chain stories in any status but removed, so admins can moderate before anyone flags them. */
export async function listChainStoriesForAdmin(db: Db): Promise<ModerationItem[]> {
  const flags = await openFlagsByTarget(db);
  const chainDocs = await db
    .collection('chainEntries')
    .find({ story: { $exists: true }, status: { $ne: 'removed' } })
    .sort({ updatedAt: -1 })
    .limit(RECENT_STORIES)
    .toArray();
  return buildItems(db, [], chainDocs, flags);
}
