const categoryColors: Record<string, string> = {
  job: 'from-slate-blue/20 to-teal/10',
  education: 'from-lavender/30 to-stamp-blue/10',
  family: 'from-dusty-rose/25 to-amber/10',
  health: 'from-sage/30 to-teal/10',
  money: 'from-evidence-yellow/25 to-amber/15',
  marriage: 'from-dusty-rose/30 to-coral/10',
  food: 'from-amber/25 to-coral/10',
  home: 'from-amber/20 to-evidence-yellow/15',
  deathRites: 'from-ink/10 to-slate-blue/10',
  numbers: 'from-lavender/30 to-slate-blue/10',
  animals: 'from-sage/30 to-teal/10',
  travel: 'from-teal/20 to-stamp-blue/10',
  religionRituals: 'from-coral/15 to-lavender/20',
};

export function categoryColor(slug: string): string {
  return categoryColors[slug] ?? 'from-ink/5 to-amber/10';
}
