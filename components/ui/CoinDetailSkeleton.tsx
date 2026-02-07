import { Skeleton } from './skeleton';
import { ChartSkeleton } from './ChartSkeleton';

/**
 * Skeleton for coin detail page: header (image + name), chart, stats grid, description.
 */
export function CoinDetailSkeleton() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="mb-6 h-4 w-24" aria-label="Loading back link" />

      <header className="flex flex-wrap items-center gap-4 mb-8">
        <Skeleton className="size-16 shrink-0 rounded-full" aria-hidden />
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-7 w-48" aria-label="Loading coin name" />
          <Skeleton className="h-4 w-20" aria-label="Loading rank" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,1.2fr)_minmax(280px,1fr)] gap-8 mb-8">
        <section className="min-w-0">
          <ChartSkeleton />
        </section>
        <section className="space-y-6 min-w-0">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" aria-hidden />
                <Skeleton className="h-6 w-24" aria-hidden />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" aria-hidden />
            <Skeleton className="h-4 w-full" aria-hidden />
            <Skeleton className="h-4 w-full max-w-[90%]" aria-hidden />
          </div>
        </section>
      </div>
    </main>
  );
}
