'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. You can try again or return home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
          <span className="text-muted-foreground">·</span>
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
