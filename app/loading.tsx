import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8" aria-label="Loading">
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" aria-hidden />
          ))}
        </div>
      </div>
    </main>
  );
}
