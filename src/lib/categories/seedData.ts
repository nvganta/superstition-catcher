import type { Category } from '@/lib/schema/category';

export const CATEGORY_SEED_DATA: Category[] = [
  {
    slug: 'job',
    label: 'Job & Work',
    description: 'Workplace customs, hiring rituals, and career-related inherited defaults.',
    sortOrder: 10,
  },
  {
    slug: 'education',
    label: 'Education',
    description: 'School, exams, and learning traditions passed down as common sense.',
    sortOrder: 20,
  },
  {
    slug: 'family',
    label: 'Family',
    description: 'Kinship roles, parenting norms, and household expectations.',
    sortOrder: 30,
  },
  {
    slug: 'health',
    label: 'Health',
    description: 'Body, illness, and wellness practices treated as default wisdom.',
    sortOrder: 40,
  },
  {
    slug: 'money',
    label: 'Money',
    description: 'Spending, saving, and prosperity beliefs that shape daily choices.',
    sortOrder: 50,
  },
  {
    slug: 'marriage',
    label: 'Marriage & Love',
    description: 'Courtship, weddings, and partnership customs.',
    sortOrder: 60,
  },
  {
    slug: 'food',
    label: 'Food & Eating',
    description: 'Mealtime rules, ingredients, and dining taboos.',
    sortOrder: 70,
  },
  {
    slug: 'home',
    label: 'Home & Daily Life',
    description: 'Threshold, cleaning, and everyday household practices.',
    sortOrder: 80,
  },
  {
    slug: 'deathRites',
    label: 'Death & Rites',
    description: 'Mourning, afterlife beliefs, and funeral customs.',
    sortOrder: 90,
  },
  {
    slug: 'numbers',
    label: 'Numbers',
    description: 'Lucky, unlucky, and symbolic numerals across cultures.',
    sortOrder: 100,
  },
  {
    slug: 'animals',
    label: 'Animals',
    description: 'Creatures treated as omens, protectors, or taboo.',
    sortOrder: 110,
  },
  {
    slug: 'travel',
    label: 'Travel & Journey',
    description: 'Departures, journeys, and movement-related customs.',
    sortOrder: 120,
  },
  {
    slug: 'religionRituals',
    label: 'Religion & Rituals',
    description: 'Sacred practices, festivals, and devotional inherited defaults.',
    sortOrder: 130,
  },
];
