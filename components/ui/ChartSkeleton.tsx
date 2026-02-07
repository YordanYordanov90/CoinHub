import { Skeleton } from './skeleton';

/**
 * Skeleton for chart area. Matches CandlestickChart min height.
 */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Loading chart"
    >
      <Skeleton className="h-[320px] w-full rounded-lg" />
    </div>
  );
}
