import type { Db } from 'mongodb';
import type { RateLimitAction } from '@/lib/schema/rateLimit';

export interface RateLimitDecision {
  allowed: boolean;
  retryAfter: number;
  reason?: string;
}

export const DAILY_LIMITS: Record<Exclude<RateLimitAction, 'post'>, number> = {
  newEntry: 5,
  chainStory: 10,
  flag: 20,
};

export const MIN_POST_INTERVAL_SECONDS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcDay(date: Date): Date {
  const start = startOfUtcDay(date);
  return new Date(start.getTime() + DAY_MS);
}

export async function checkRateLimit(
  db: Db,
  visitorId: string,
  action: RateLimitAction,
  now = new Date()
): Promise<RateLimitDecision> {
  const collection = db.collection('rateLimits');
  const windowStart = startOfUtcDay(now);
  const expiresAt = endOfUtcDay(now);

  const lastPost = await collection.findOne(
    { visitorId, action: 'post' },
    { sort: { lastPostAt: -1 } }
  );

  if (lastPost?.lastPostAt) {
    const elapsedMs = now.getTime() - new Date(lastPost.lastPostAt).getTime();
    const minIntervalMs = MIN_POST_INTERVAL_SECONDS * 1000;
    if (elapsedMs < minIntervalMs) {
      const retryAfter = Math.ceil((minIntervalMs - elapsedMs) / 1000);
      return {
        allowed: false,
        retryAfter,
        reason: `Please wait ${retryAfter}s before posting again`,
      };
    }
  }

  if (action === 'post') {
    return { allowed: true, retryAfter: 0 };
  }

  const dailyLimit = DAILY_LIMITS[action];
  const dailyDoc = await collection.findOne({ visitorId, action, windowStart });

  if (dailyDoc && dailyDoc.count >= dailyLimit) {
    const retryAfter = Math.ceil((expiresAt.getTime() - now.getTime()) / 1000);
    return {
      allowed: false,
      retryAfter,
      reason: `Daily limit reached for ${action} (${dailyLimit}/day)`,
    };
  }

  return { allowed: true, retryAfter: 0 };
}

export async function recordRateLimitEvent(
  db: Db,
  visitorId: string,
  action: RateLimitAction,
  now = new Date()
): Promise<void> {
  const collection = db.collection('rateLimits');
  const windowStart = startOfUtcDay(now);
  const expiresAt = endOfUtcDay(now);

  await collection.updateOne(
    { visitorId, action: 'post' },
    {
      $set: {
        visitorId,
        action: 'post',
        count: 1,
        windowStart,
        lastPostAt: now,
        expiresAt,
      },
    },
    { upsert: true }
  );

  if (action === 'post') {
    return;
  }

  await collection.updateOne(
    { visitorId, action, windowStart },
    {
      $setOnInsert: {
        visitorId,
        action,
        windowStart,
        expiresAt,
        count: 0,
      },
      $inc: { count: 1 },
      $set: { expiresAt },
    },
    { upsert: true }
  );
}
