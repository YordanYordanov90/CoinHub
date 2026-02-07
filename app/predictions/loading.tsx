import { Skeleton } from '@/components/ui/skeleton';

export default function PredictionsLoading() {
  return (
    <main className="container mx-auto min-w-0 px-4 sm:px-6 py-8" aria-label="Loading predictions">
      <header className="mb-8">
        <Skeleton className="h-8 w-64" aria-hidden />
        <Skeleton className="mt-2 h-4 w-full max-w-md" aria-hidden />
      </header>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            className="h-48 rounded-lg border border-border/40"
            aria-label="Loading prediction card"
          />
        ))}
      </div>
    </main>
  );
}
