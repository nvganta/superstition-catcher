import type { Db } from 'mongodb';
import { z } from 'zod';
import { checkContent } from '@/lib/guardrails/checkContent';
import { FIELD_LIMITS } from '@/lib/guardrails/limits';
import { checkRateLimit, recordRateLimitEvent } from '@/lib/guardrails/rateLimit';
import { optionalText, visitorIdSchema } from '@/lib/entries/input';
import { issuesFrom, type WriteFailure } from '@/lib/entries/results';
import { flagReasonSchema, flagSchema, flagTargetTypeSchema } from '@/lib/schema/flag';
import { FLAG_THRESHOLD, FLAGGABLE_STATUSES, MAX_SYSTEM_TAKEDOWNS_PER_HOUR } from './statusMachine';
import { findTarget, targetCollection } from './targets';
import { applyStatusEvent, countOpenFlags } from './transitions';

const HOUR_MS = 60 * 60 * 1000;

async function takedownBrakeOn(db: Db, now: Date): Promise<boolean> {
  const recent = await db
    .collection('statusTransitions')
    .countDocuments({ actor: 'system', at: { $gt: new Date(now.getTime() - HOUR_MS) } });
  return recent >= MAX_SYSTEM_TAKEDOWNS_PER_HOUR;
}

export const flagInputSchema = z.object({
  visitorId: visitorIdSchema,
  targetType: flagTargetTypeSchema,
  targetId: z.string().min(1).max(120),
  reason: flagReasonSchema,
  note: optionalText(FIELD_LIMITS.flagNote),
});

export type FlagResult = { kind: 'recorded' } | { kind: 'alreadyFlagged' } | WriteFailure;

export async function flagTarget(db: Db, raw: unknown, now = new Date()): Promise<FlagResult> {
  const parsed = flagInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { kind: 'invalid', issues: issuesFrom(parsed.error) };
  }
  const { visitorId, note, reason } = parsed.data;
  const ref = { targetType: parsed.data.targetType, targetId: parsed.data.targetId };

  const target = await findTarget(db, ref);
  if (!target || !target.hasContent || !FLAGGABLE_STATUSES.includes(target.status)) {
    return { kind: 'notFound' };
  }

  // Only admins read flag notes, and a report of someone's phone number may need to quote it,
  // so contact details are allowed here. Slurs and spam are not.
  if (note && checkContent({ contentType: 'flag', fields: { flagNote: note } }).result === 'blocked') {
    return { kind: 'rejected', guardrail: 'blocked', issues: [{ field: 'note', message: 'This note breaks our posting rules.' }] };
  }

  // One open flag per visitor per target. Once an admin resolves it the visitor can report again,
  // since a chain story can be rewritten after a restore.
  const flags = db.collection('flags');
  const identity = { targetType: ref.targetType, targetId: ref.targetId, visitorId, resolvedAt: { $exists: false } };
  if (await flags.findOne(identity)) {
    return { kind: 'alreadyFlagged' };
  }

  const limit = await checkRateLimit(db, visitorId, 'flag', now);
  if (!limit.allowed) {
    return { kind: 'rateLimited', retryAfter: limit.retryAfter, message: limit.reason ?? 'Please slow down.' };
  }

  const flag = flagSchema.parse({ ...ref, entryId: target.entryId, visitorId, reason, note, createdAt: now });
  const inserted = await flags.updateOne(identity, { $setOnInsert: flag }, { upsert: true });
  if (inserted.upsertedCount === 0) {
    return { kind: 'alreadyFlagged' };
  }
  await recordRateLimitEvent(db, visitorId, 'flag', now);

  await targetCollection(db, ref.targetType).updateOne({ id: ref.targetId }, { $inc: { flagCount: 1 } });
  if (
    target.hidesOnFlags &&
    (await countOpenFlags(db, ref)) >= FLAG_THRESHOLD &&
    !(await takedownBrakeOn(db, now))
  ) {
    await applyStatusEvent(db, ref, 'flagThresholdReached', 'system', now);
  }

  return { kind: 'recorded' };
}
