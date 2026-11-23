'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { EntryOrigin } from '@/lib/schema/common';
import OriginBadge from './OriginBadge';

interface SearchResult {
  id: string;
  title: string;
  country: string;
  countryFlag: string;
  origin: EntryOrigin;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 200;

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchedFor, setSearchedFor] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearchedFor('');
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/entries?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        setResults(await res.json());
        setSearchedFor(trimmed);
        setIsOpen(true);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search failed:', error);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search traditions... e.g. &quot;black cat&quot;, &quot;mirror&quot;, &quot;Japan&quot;"
          aria-label="Search entries"
          className="w-full pl-12 pr-4 py-3.5 bg-paper border-2 border-ink/10 rounded-xl font-body text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-paper border-2 border-ink/10 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-ink/5">
            <span className="text-xs font-mono text-ink/40 px-2">
              {results.length} entr{results.length !== 1 ? 'ies' : 'y'} found
            </span>
          </div>
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/superstition/${result.id}`}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-amber/10 transition-colors border-b border-ink/5 last:border-b-0"
            >
              <span className="text-lg shrink-0">{result.countryFlag}</span>
              <div className="flex-grow min-w-0">
                <div className="font-semibold text-sm text-ink truncate">{result.title}</div>
                <div className="text-xs text-ink/50">{result.country}</div>
              </div>
              <OriginBadge origin={result.origin} />
            </Link>
          ))}
        </div>
      )}

      {isOpen && searchedFor && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-paper border-2 border-ink/10 rounded-xl shadow-lg p-6 text-center z-50">
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-semibold text-ink/60 text-sm">No entries found</div>
          <div className="text-xs text-ink/40 mt-1">
            Try a country, an animal, or a word from the story.{' '}
            <Link href="/post" className="text-coral font-semibold hover:underline">
              Or add it yourself
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
