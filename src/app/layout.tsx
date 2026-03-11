import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Superstition Catcher — Busting Myths From Around the World',
  description:
    'Discover the real reasons behind superstitions from India, Japan, China, and beyond. Every myth investigated, every origin uncovered.',
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
                  SUPERSTITION CATCHER
                </span>
              </div>
              <p className="text-sm text-ink/30 text-center">
                No superstitions were harmed in the making of this website.
                <br className="sm:hidden" /> Well, maybe a few were busted.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
