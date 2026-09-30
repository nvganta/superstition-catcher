import { z } from 'zod';

export const rateLimitActionSchema = z.enum([
  'newEntry',
  'chainStory',
  'flag',
  'post',
]);

export type RateLimitAction = z.infer<typeof rateLimitActionSchema>;

export const rateLimitSchema = z.object({
  visitorId: z.string().uuid(),
  action: rateLimitActionSchema,
  count: z.number().int().nonnegative(),
  windowStart: z.coerce.date(),
  lastPostAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
});

export type RateLimit = z.infer<typeof rateLimitSchema>;
