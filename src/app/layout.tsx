import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import PostEntryButton from '@/components/PostEntryButton';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Superstition Buster: A Living Record of Inherited Traditions',
  description:
    'Traditions from India, Japan, China, and beyond, as inherited defaults worth a fresh look: where they started, why they stuck, and what has changed since.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased noise-bg min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t-2 border-ink/5 mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔎</span>
                <span className="font-display text-sm text-ink/40">
                  SUPERSTITION BUSTER
                </span>
              </div>
              <p className="text-sm text-ink/30 text-center">
                No superstitions were harmed in the making of this website.
                <br className="sm:hidden" /> Well, maybe a few were busted.
              </p>
            </div>
          </div>
        </footer>
        <PostEntryButton />
        <Analytics />
      </body>
    </html>
  );
}
