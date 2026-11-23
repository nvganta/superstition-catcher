import type { Db, Document } from 'mongodb';
import { entryStatusSchema, type EntryStatus } from '@/lib/schema/common';
import type { FlagTargetType } from '@/lib/schema/flag';

export interface TargetRef {
  targetType: FlagTargetType;
  targetId: string;
}

export interface ModerationTarget extends TargetRef {
  entryId: string;
  status: EntryStatus;
  /** Whether the target has public text to moderate. A chain answer without a story has none. */
  hasContent: boolean;
  /**
   * Whether reaching the flag threshold takes it off public pages. Curated entries were reviewed by
   * the editors before going live, so flags queue them for a second look but never hide them.
   */
  hidesOnFlags: boolean;
}

const TARGETS: Record<FlagTargetType, { collection: string; describe: (doc: Document) => Omit<ModerationTarget, keyof TargetRef | 'status'> }> = {
  entry: {
    collection: 'entries',
    describe: (doc) => ({ entryId: String(doc.id), hasContent: true, hidesOnFlags: doc.origin !== 'curated' }),
  },
  chainEntry: {
    collection: 'chainEntries',
    describe: (doc) => ({ entryId: String(doc.entryId), hasContent: doc.story != null, hidesOnFlags: true }),
  },
};

export function targetCollection(db: Db, targetType: FlagTargetType) {
  return db.collection(TARGETS[targetType].collection);
}

export async function findTarget(db: Db, ref: TargetRef): Promise<ModerationTarget | null> {
  const doc = await targetCollection(db, ref.targetType).findOne({ id: ref.targetId });
  const status = entryStatusSchema.safeParse(doc?.status);
  if (!doc || !status.success) {
    return null;
  }
  return { ...ref, ...TARGETS[ref.targetType].describe(doc), status: status.data };
}
