import type { Db } from 'mongodb';
import { categorySchema } from '@/lib/schema/category';
import { CATEGORY_SEED_DATA } from './seedData';

export async function seedCategories(db: Db): Promise<{ upserted: number }> {
  const collection = db.collection('categories');
  let upserted = 0;

  for (const category of CATEGORY_SEED_DATA) {
    categorySchema.parse(category);
    const result = await collection.updateOne(
      { slug: category.slug },
      { $set: category },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      upserted += 1;
    }
  }

  return { upserted };
}
