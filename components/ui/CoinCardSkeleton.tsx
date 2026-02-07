import { Skeleton } from './skeleton';

/**
 * Skeleton for one coin row/card: circular image, name, price, 24h change.
 * Responsive; matches coins table row layout.
 */
export function CoinCardSkeleton() {
  return (
    <tr className="border-b border-border/50">
      <td className="py-4 pl-5">
        <Skeleton className="h-5 w-8" aria-label="Loading rank" />
      </td>
      <td className="py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" aria-hidden />
          <Skeleton className="h-4 w-24 sm:w-32" aria-label="Loading coin name" />
        </div>
      </td>
      <td className="py-4">
        <Skeleton className="h-4 w-20" aria-label="Loading price" />
      </td>
      <td className="py-4">
        <Skeleton className="h-4 w-14" aria-label="Loading 24h change" />
      </td>
      <td className="py-4 pr-5">
        <Skeleton className="h-4 w-24 hidden sm:block" aria-label="Loading market cap" />
      </td>
    </tr>
  );
}
