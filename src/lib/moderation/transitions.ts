import type { Db } from 'mongodb';
import type { EntryStatus } from '@/lib/schema/common';
import { statusTransitionSchema, type StatusActor, type StatusEvent } from '@/lib/schema/statusTransition';
import { FLAG_RESOLUTIONS, nextStatus } from './statusMachine';
import { findTarget, targetCollection, type TargetRef } from './targets';

export type TransitionResult =
  | { kind: 'transitioned'; from: EntryStatus; to: EntryStatus }
  | { kind: 'notFound' }
  | { kind: 'refused'; message: string };

export async function countOpenFlags(db: Db, ref: TargetRef): Promise<number> {
  return db.collection('flags').countDocuments({ ...ref, resolvedAt: { $exists: false } });
}

/**
 * Moves a target through the status machine. The update is conditional on the status it was read
 * in, so two moderators (or a moderator and the flag threshold) cannot both apply a change from
 * the same starting point. Each change is appended to statusTransitions with who and when.
 */
export async function applyStatusEvent(
  db: Db,
  ref: TargetRef,
  event: StatusEvent,
  actor: StatusActor,
  now = new Date()
): Promise<TransitionResult> {
  const target = await findTarget(db, ref);
  if (!target) {
    return { kind: 'notFound' };
  }
  const to = nextStatus(target.status, event, actor);
  if (!to) {
    return { kind: 'refused', message: `Cannot ${event} from ${target.status}.` };
  }

  const collection = targetCollection(db, ref.targetType);
  const moved = await collection.updateOne(
    { id: ref.targetId, status: target.status },
    { $set: { status: to } }
  );
  if (moved.matchedCount === 0) {
    return { kind: 'refused', message: 'The status changed while you were looking. Reload and try again.' };
  }

  await db.collection('statusTransitions').insertOne(
    statusTransitionSchema.parse({ ...ref, entryId: target.entryId, event, from: target.status, to, actor, at: now })
  );

  const resolution = FLAG_RESOLUTIONS[event];
  if (resolution) {
    const resolved = await db
      .collection('flags')
      .updateMany(
        { ...ref, resolvedAt: { $exists: false }, createdAt: { $lte: now } },
        { $set: { resolvedAt: now, resolution } }
      );
    if (resolved.modifiedCount > 0) {
      await collection.updateOne({ id: ref.targetId }, { $inc: { flagCount: -resolved.modifiedCount } });
    }
  }

  return { kind: 'transitioned', from: target.status, to };
}
