'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import DataTable, { type DataTableColumn } from '@/components/data-table';
import CoinsPagination from '@/components/coins-pagination';
import CoinImage from '@/components/ui/CoinImage';
import { CoinCardSkeleton } from '@/components/ui/CoinCardSkeleton';
import { PriceChangeDisplay } from '@/components/ui/price-change';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCoins } from '@/lib/hooks/useCoins';
import { useCryptoStore } from '@/lib/store/useCryptoStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { formatCurrency } from '@/lib/utils';
import type { CoinMarket } from '@/types/api';

const COINS_PAGE_SIZE = 250;
const PER_PAGE = 10;
const LOADING_ROWS = 8;

interface CoinsTableClientProps {
  currentPage: number;
}

export default function CoinsTableClient({ currentPage }: CoinsTableClientProps) {
  const favorites = useCryptoStore((state) => state.favorites);
  const toggleFavorite = useCryptoStore((state) => state.toggleFavorite);
  const currency = useUIStore((state) => state.currency);
  const sortByPreference = useUIStore((state) => state.sortBy);
  const sortOrder = useUIStore((state) => state.sortOrder);

  const sortBy =
    sortByPreference === 'price'
      ? (sortOrder === 'asc' ? 'market_cap_asc' : 'market_cap_desc')
      : sortByPreference === 'volume'
        ? (sortOrder === 'asc' ? 'volume_asc' : 'volume_desc')
        : (sortOrder === 'asc' ? 'market_cap_asc' : 'market_cap_desc');

  const { data: allCoins = [], error, isLoading } = useCoins({
    currency,
    perPage: COINS_PAGE_SIZE,
    page: 1,
    sortBy,
  });

  if (isLoading) {
    return (
      <>
        <Table className="coins-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="bg-muted/50 text-muted-foreground py-4 first:pl-5 last:pr-5 font-medium">
                Fav
              </TableHead>
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
            {Array.from({ length: LOADING_ROWS }).map((_, i) => (
              <CoinCardSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center gap-2 mt-6">
          <Skeleton className="h-9 w-24" aria-hidden />
          <Skeleton className="h-9 w-24" aria-hidden />
        </div>
      </>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">Failed to load coins.</p>;
  }

  const totalPages = Math.max(1, Math.ceil(allCoins.length / PER_PAGE));
  const pageIndex = Math.min(currentPage - 1, totalPages - 1);
  const coinsData = allCoins.slice(pageIndex * PER_PAGE, (pageIndex + 1) * PER_PAGE);

  const columns: DataTableColumn<CoinMarket>[] = [
    {
      header: 'Fav',
      cellClassName: 'w-10',
      cell: (coin) => {
        const favorite = favorites.includes(coin.id);
        return (
          <button
            type="button"
            aria-label={favorite ? `Remove ${coin.name} from favorites` : `Add ${coin.name} to favorites`}
            onClick={() => toggleFavorite(coin.id)}
            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-accent"
          >
            <Heart
              className={`size-4 ${favorite ? 'fill-current text-orange-500' : 'text-muted-foreground'}`}
            />
          </button>
        );
      },
    },
    {
      header: 'Rank',
      cellClassName: 'rank-cell',
      cell: (coin) => (
        <Link href={`/coins/${coin.id}`} className="text-foreground hover:underline" aria-label={`View ${coin.name}`}>
          #{coin.market_cap_rank}
        </Link>
      ),
    },
    {
      header: 'Token',
      cellClassName: 'token-cell',
      cell: (coin) => (
        <Link href={`/coins/${coin.id}`} className="token-info flex items-center gap-3" aria-label={`View ${coin.name}`}>
          <CoinImage src={coin.image} alt={coin.name} width={36} height={36} />
          <p>
            {coin.name} ({coin.symbol.toUpperCase()})
          </p>
        </Link>
      ),
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (coin) => formatCurrency(coin.current_price),
    },
    {
      header: '24h Change',
      cellClassName: 'change-cell',
      cell: (coin) => (
        <PriceChangeDisplay value={coin.price_change_percentage_24h} />
      ),
    },
    {
      header: 'Market Cap',
      cellClassName: 'market-cap-cell',
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  const hasMorePages = currentPage < totalPages;

  return (
    <>
      <DataTable
        tableClassName="coins-table"
        columns={columns}
        data={coinsData}
        rowKey={(coin) => coin.id}
      />

      <CoinsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasMorePages={hasMorePages}
      />
    </>
  );
}
