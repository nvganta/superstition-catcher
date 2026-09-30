import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { seedCategories } from '@/lib/categories/seedCategories';

export async function GET() {
  try {
    const db = await getDb();
    await seedCategories(db);

    const categories = await db
      .collection('categories')
      .find({})
      .sort({ sortOrder: 1 })
      .toArray();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
