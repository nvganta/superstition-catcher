import { getEntryStore } from '@/lib/entries/store';
import PostEntryForm from '@/components/PostEntryForm';

export const dynamic = 'force-dynamic';

export default async function PostPage() {
  const store = await getEntryStore();
  const categories = await store.listCategories();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <div className="evidence-tag inline-block mb-4">Add to the Record</div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-3">
          Post a tradition
        </h1>
        <p className="text-ink/50 max-w-xl">
          Something you were raised to do without being told why. Write it down the way it was
          handed to you, and what you make of it now.
        </p>
      </div>

      <div className="paper-card rounded-xl p-6 sm:p-8">
        <PostEntryForm categories={categories} />
      </div>
    </div>
  );
}
