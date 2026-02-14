'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import PredictionMarketCard from '@/components/predictions/market-card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePredictions } from '@/lib/hooks/usePredictions';

function RateLimitMessage() {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-6 text-center">
      <p className="font-medium text-foreground">CoinGecko rate limit reached</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Too many requests in a short time. Wait a minute and try again, or visit another page and come back.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default function PredictionsClient() {
  const { mutate, data: markets, error, isPending } = usePredictions();

  useEffect(() => {
    mutate({ limit: 15 });
  }, [mutate]);

  if (isPending) {
    return (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            className="h-48 rounded-lg border border-border/40"
            aria-label="Loading prediction card"
          />
        ))}
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes('rate')) {
      return <RateLimitMessage />;
    }
    return <p className="text-sm text-destructive">Failed to load prediction markets.</p>;
  }

  if (!markets || markets.length === 0) {
    return <p className="text-center text-muted-foreground">No prediction markets available.</p>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {markets.map((market) => (
        <li key={market.coinId}>
          <PredictionMarketCard market={market} />
        </li>
      ))}
    </ul>
  );
}
