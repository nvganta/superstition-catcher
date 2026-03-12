'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/explore', label: 'Explore', icon: '🗺️' },
  { href: '/categories', label: 'Categories', icon: '📂' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b-2 border-ink/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl" role="img" aria-label="magnifying glass">
              🔎
            </span>
            <div className="flex flex-col">
              <span className="font-display text-base sm:text-lg text-ink leading-none tracking-tight">
                SUPERSTITION
              </span>
              <span className="font-display text-[0.6rem] sm:text-xs text-coral tracking-[0.2em] leading-none">
                BUSTER
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {links.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-ink text-cream'
                      : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                  }`}
                  title={link.label}
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
