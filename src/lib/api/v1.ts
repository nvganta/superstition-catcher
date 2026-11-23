import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { PublicEntry } from '@/lib/entries/documents';
import type { Category } from '@/lib/schema/category';
import { entryOriginSchema, regionSchema, type Source } from '@/lib/schema/common';
import { issuesFrom } from '@/lib/entries/results';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

/** Short enough that a moderation takedown leaves the CDN within about two minutes. */
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=60' };

const pageNumber = (fallback: number, max?: number) =>
  z.preprocess(
    (value) => (value === null || value === '' ? undefined : value),
    z.coerce.number().int().min(1).max(max ?? Number.MAX_SAFE_INTEGER).default(fallback)
  );

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === null || value === '' ? undefined : value), schema.optional());

export const entryListQuerySchema = z.object({
  region: optional(regionSchema),
  category: optional(z.string().min(1).max(64)),
  origin: optional(entryOriginSchema),
  page: pageNumber(1),
  limit: pageNumber(DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
});

export type EntryListQuery = z.infer<typeof entryListQuerySchema>;

export function parseEntryListQuery(params: URLSearchParams) {
  return entryListQuerySchema.safeParse({
    region: params.get('region'),
    category: params.get('category'),
    origin: params.get('origin'),
    page: params.get('page'),
    limit: params.get('limit'),
  });
}

/** The public shape of an entry. Listed field by field, so a new private field never leaks by default. */
export interface ApiEntry {
  id: string;
  url: string;
  title: string;
  country: string;
  countryFlag: string;
  region: PublicEntry['region'];
  categorySlugs: string[];
  tags: string[];
  theDefault: string;
  whyItStarted: string;
  whyItStuck: string;
  whatsChangedSince: string;
  freshLook?: string;
  sources: Source[];
  confidence?: PublicEntry['confidence'];
  uncertaintyNote?: string;
  origin: PublicEntry['origin'];
  postedBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export function toApiEntry(entry: PublicEntry, siteOrigin: string): ApiEntry {
  return {
    id: entry.id,
    url: `${siteOrigin}/superstition/${entry.id}`,
    title: entry.title,
    country: entry.country,
    countryFlag: entry.countryFlag,
    region: entry.region,
    categorySlugs: entry.categorySlugs,
    tags: entry.tags,
    theDefault: entry.theDefault,
    whyItStarted: entry.whyItStarted,
    whyItStuck: entry.whyItStuck,
    whatsChangedSince: entry.whatsChangedSince,
    freshLook: entry.freshLook,
    sources: entry.sources.map(({ title, url, kind }) => ({ title, url, kind })),
    confidence: entry.confidence,
    uncertaintyNote: entry.uncertaintyNote,
    origin: entry.origin,
    postedBy: entry.postedBy,
    version: entry.version,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export function toApiCategory({ slug, label, description, parentSlug }: Category) {
  return { slug, label, description, parentSlug };
}

export function apiJson(body: unknown): NextResponse {
  return NextResponse.json(body, { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } });
}

export function apiError(status: number, error: string, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    { error, message, ...extra },
    { status, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
  );
}

export function apiInvalidQuery(error: z.ZodError) {
  return apiError(400, 'invalid', 'Some query parameters are not valid.', { issues: issuesFrom(error) });
}

export function apiPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
