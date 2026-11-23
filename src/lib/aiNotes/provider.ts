import Anthropic from '@anthropic-ai/sdk';
import type { PublicEntry } from '@/lib/entries/documents';
import { createAnthropicNoteProvider } from './anthropic';

export interface DraftedNote {
  body: string;
  uncertainty: string;
  /** The model that actually wrote it, which a server-side fallback can change. */
  model: string;
}

export interface AiNoteProvider {
  promptVersion: string;
  draft(entry: PublicEntry): Promise<DraftedNote>;
}

const LOOPBACK_MONGO_URI = /^mongodb:\/\/(?:[^@/]*@)?(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?(?:[/?]|$)/i;

/**
 * The stub writes canned notes so the admin flow can be driven without a paid call. It answers
 * only when the database is on this machine and Vercel does not call the deployment production,
 * since `next start` sets NODE_ENV to production even on a laptop.
 */
export function stubProviderAllowed(env: NodeJS.ProcessEnv): boolean {
  return (
    env.AI_NOTES_PROVIDER === 'stub' &&
    env.VERCEL_ENV !== 'production' &&
    LOOPBACK_MONGO_URI.test(env.MONGODB_URI ?? '')
  );
}

export const stubNoteProvider: AiNoteProvider = {
  promptVersion: 'stub-v1',
  async draft(entry) {
    return {
      body: `Stub context note for "${entry.title}" (${entry.country}). The local stub provider wrote this text; no model read the entry.`,
      uncertainty: 'Stub output. Nothing in it was checked against any source.',
      model: 'stub',
    };
  },
};

export function resolveAiNoteProvider(env: NodeJS.ProcessEnv = process.env): AiNoteProvider | null {
  if (env.AI_NOTES_PROVIDER === 'stub') {
    if (stubProviderAllowed(env)) return stubNoteProvider;
    console.warn('AI_NOTES_PROVIDER=stub refused: the stub runs only against a local database outside production.');
    return null;
  }
  const apiKey = env.ANTHROPIC_API_KEY?.trim();
  return apiKey ? createAnthropicNoteProvider(new Anthropic({ apiKey })) : null;
}
