'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Coins } from 'lucide-react';

export default function CoinsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Coins page error boundary:', error);
  }, [error]);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400" aria-hidden>
            <Coins className="h-6 w-6" />
          </span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">Failed to load coins data</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t load the coins list. Check your network connection and try again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
