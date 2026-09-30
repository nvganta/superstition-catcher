import { z } from 'zod';

export const visitorSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  lastSeenAt: z.coerce.date().optional(),
});

export type Visitor = z.infer<typeof visitorSchema>;
