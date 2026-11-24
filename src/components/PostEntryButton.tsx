'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PostEntryButton() {
  const pathname = usePathname();
  if (pathname === '/post' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Link
      href="/post"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-coral to-amber text-white"
      aria-label="Post a tradition"
    >
      <span className="text-lg">🔮</span>
      <span className="text-sm font-semibold tracking-tight hidden sm:inline">Got a tradition?</span>
    </Link>
  );
}
