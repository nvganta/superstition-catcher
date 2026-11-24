import type { z } from 'zod';
import type { Entry } from '@/lib/schema/entry';

export interface FieldIssue {
  field?: string;
  message: string;
}

export type EntryWriteResult =
  | { kind: 'created'; entry: Entry }
  | { kind: 'saved'; entry: Entry }
  | { kind: 'invalid'; issues: FieldIssue[] }
  | { kind: 'rejected'; guardrail: 'heldForEdit' | 'blocked'; issues: FieldIssue[] }
  | { kind: 'rateLimited'; retryAfter: number; message: string }
  | { kind: 'notFound' }
  | { kind: 'conflict'; currentVersion: number }
  | { kind: 'duplicateId'; id: string };

export function issuesFrom(error: z.ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : undefined,
    message: issue.message,
  }));
}

export function invalid(field: string, message: string): EntryWriteResult {
  return { kind: 'invalid', issues: [{ field, message }] };
}
