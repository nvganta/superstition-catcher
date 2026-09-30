export const FIELD_LIMITS = {
  title: 200,
  country: 80,
  postedBy: 80,
  tag: 50,
  maxTags: 20,
  theDefault: 5000,
  whyItStarted: 5000,
  whyItStuck: 5000,
  whatsChangedSince: 5000,
  freshLook: 5000,
  uncertaintyNote: 1000,
  sourceTitle: 200,
  maxSources: 20,
  chainText: 2000,
  flagNote: 500,
} as const;

export type GuardrailField =
  | 'title'
  | 'country'
  | 'postedBy'
  | 'theDefault'
  | 'whyItStarted'
  | 'whyItStuck'
  | 'whatsChangedSince'
  | 'freshLook'
  | 'uncertaintyNote'
  | 'chainText'
  | 'flagNote';

export function trimField(field: GuardrailField, value: string): string {
  const limit = FIELD_LIMITS[field];
  return value.trim().slice(0, limit);
}
