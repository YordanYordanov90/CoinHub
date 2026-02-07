import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { CoinCardSkeleton } from '@/components/ui/CoinCardSkeleton';

const ROWS = 8;

export default function CoinsLoading() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8" aria-label="Loading coins">
      <div className="content">
        <Skeleton className="mb-6 h-8 w-32" aria-hidden />
        <Table className="coins-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="bg-muted/50 text-muted-foreground py-4 first:pl-5 last:pr-5 font-medium">
                Rank
              </TableHead>
              <TableHead className="bg-muted/50 text-muted-foreground py-4 first:pl-5 last:pr-5 font-medium">
                Token
              </TableHead>
              <TableHead className="bg-muted/50 text-muted-foreground py-4 first:pl-5 last:pr-5 font-medium">
                Price
              </TableHead>
              <TableHead className="bg-muted/50 text-muted-foreground py-4 first:pl-5 last:pr-5 font-medium">
                24h Change
              </TableHead>
              <TableHead className="bg-muted/50 text-muted-foreground py-4 first:pl-5 last:pr-5 font-medium hidden sm:table-cell">
                Market Cap
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROWS }).map((_, i) => (
              <CoinCardSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center gap-2 mt-6">
          <Skeleton className="h-9 w-24" aria-hidden />
          <Skeleton className="h-9 w-24" aria-hidden />
        </div>
      </div>
    </main>
  );
}
