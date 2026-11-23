'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ensureVisitorCookie } from '@/lib/visitorId';

/** Re-renders once when an older localStorage visitor id first reaches the server, so their hidden entries drop out. */
export default function VisitorCookieSync() {
  const router = useRouter();

  useEffect(() => {
    if (ensureVisitorCookie() === 'restored') {
      router.refresh();
    }
  }, [router]);

  return null;
}
