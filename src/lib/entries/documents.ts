import type { Db, Document } from 'mongodb';
import { categorySchema, type Category } from '@/lib/schema/category';
import { entrySchema, type Entry } from '@/lib/schema/entry';
import { entryVersionSchema } from '@/lib/schema/entryVersion';

export function parseEntryDocs(docs: Document[]): Entry[] {
  return docs.flatMap((doc) => {
    const parsed = entrySchema.safeParse(doc);
    if (parsed.success) {
      return [parsed.data];
    }
    console.error(`entries: skipping invalid document "${String(doc.id)}"`, parsed.error.issues);
    return [];
  });
}

export function parseCategoryDocs(docs: Document[]): Category[] {
  return docs.flatMap((doc) => {
    const parsed = categorySchema.safeParse(doc);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function unknownCategorySlugs(db: Db, slugs: string[]): Promise<string[]> {
  const found = await db
    .collection('categories')
    .find({ slug: { $in: slugs } }, { projection: { slug: 1 } })
    .toArray();
  const known = new Set(found.map((doc) => doc.slug as string));
  return slugs.filter((slug) => !known.has(slug));
}

export async function writeVersionSnapshot(db: Db, entry: Entry, now: Date): Promise<void> {
  const version = entryVersionSchema.parse({
    entryId: entry.id,
    version: entry.version,
    snapshot: entry,
    createdAt: now,
  });

  await db
    .collection('entryVersions')
    .updateOne(
      { entryId: version.entryId, version: version.version },
      { $setOnInsert: version },
      { upsert: true }
    );
}

export function slugify(text: string): string {
  const slug = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return slug || 'entry';
}

export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000;
}
