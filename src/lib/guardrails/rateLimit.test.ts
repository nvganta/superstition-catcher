import { describe, expect, it } from 'vitest';
import { createInMemoryTestDb } from '@/test/inMemoryMongo';
import { checkRateLimit, recordRateLimitEvent, DAILY_LIMITS, MIN_POST_INTERVAL_SECONDS } from './rateLimit';

const visitorId = '00000000-0000-4000-8000-000000000099';

describe('rate limits', () => {
  it('enforces minimum interval between posts', async () => {
    const { db, cleanup } = await createInMemoryTestDb();
    const now = new Date('2026-01-01T12:00:00.000Z');

    await recordRateLimitEvent(db, visitorId, 'newEntry', now);

    const blocked = await checkRateLimit(
      db,
      visitorId,
      'chainStory',
      new Date(now.getTime() + 10_000)
    );

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(MIN_POST_INTERVAL_SECONDS);
    expect(blocked.reason).toContain('wait');

    await cleanup();
  });

  it('allows posts after the minimum interval', async () => {
    const { db, cleanup } = await createInMemoryTestDb();
    const now = new Date('2026-01-01T12:00:00.000Z');

    await recordRateLimitEvent(db, visitorId, 'newEntry', now);

    const allowed = await checkRateLimit(
      db,
      visitorId,
      'newEntry',
      new Date(now.getTime() + MIN_POST_INTERVAL_SECONDS * 1000)
    );

    expect(allowed.allowed).toBe(true);
    expect(allowed.retryAfter).toBe(0);

    await cleanup();
  });

  it('enforces daily limits per action', async () => {
    const { db, cleanup } = await createInMemoryTestDb();
    const start = new Date('2026-01-02T08:00:00.000Z');

    for (let i = 0; i < DAILY_LIMITS.newEntry; i += 1) {
      await recordRateLimitEvent(
        db,
        visitorId,
        'newEntry',
        new Date(start.getTime() + i * 60_000)
      );
    }

    const blocked = await checkRateLimit(
      db,
      visitorId,
      'newEntry',
      new Date(start.getTime() + DAILY_LIMITS.newEntry * 60_000)
    );

    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('Daily limit');
    expect(blocked.retryAfter).toBeGreaterThan(0);

    await cleanup();
  });

  it('tracks chain stories and flags independently', async () => {
    const { db, cleanup } = await createInMemoryTestDb();
    const now = new Date('2026-01-03T09:00:00.000Z');

    for (let i = 0; i < DAILY_LIMITS.flag; i += 1) {
      await recordRateLimitEvent(db, visitorId, 'flag', new Date(now.getTime() + i * 60_000));
    }

    const blockedFlags = await checkRateLimit(db, visitorId, 'flag', new Date(now.getTime() + 3_600_000));
    expect(blockedFlags.allowed).toBe(false);

    const chainAllowed = await checkRateLimit(db, visitorId, 'chainStory', new Date(now.getTime() + 3_600_000));
    expect(chainAllowed.allowed).toBe(true);

    await cleanup();
  });
});
