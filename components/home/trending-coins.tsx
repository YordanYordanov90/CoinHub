'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { TrendingCoinsFallback } from './fallback';
import DataTable, { type DataTableColumn } from '../data-table';
import CoinImage from '@/components/ui/CoinImage';
import { PriceChangeDisplay } from '@/components/ui/price-change';
import type { TrendingCoin } from '@/types/api';
import { useTrendingCoins } from '@/lib/hooks/useTrendingCoins';

const TrendingCoins = () => {
  const { data, error, isLoading } = useTrendingCoins();
  if (isLoading) {
    return <TrendingCoinsFallback />;
  }
  if (error || !data) {
    return <TrendingCoinsFallback />;
  }

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: 'Name',
      cellClassName: 'font-medium',
      cell: (coin) => {
        const item = coin.item;

        return (
          <Link
            href={`/coins/${item.id}`}
            className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity"
          >
            <CoinImage
              src={item.large}
              alt={item.name}
              width={32}
              height={32}
              className="shrink-0 rounded-full"
            />
            <p className="truncate">{item.name}</p>
          </Link>
        );
      },
    },
    {
      header: '24h Change',
      cellClassName: 'change-cell',
      cell: (coin) => (
        <PriceChangeDisplay
          value={coin.item.data.price_change_percentage_24h.usd}
          showIcon
        />
      ),
    },
    {
      header: 'Price',
      headClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
      cell: (coin) => formatCurrency(coin.item.data.price),
    },
  ];

  return (
    <div className="h-full min-h-0 flex flex-col">
      <h4 className="text-lg font-semibold tracking-tight shrink-0">Trending Coins</h4>
      <div className="flex-1 min-h-0 flex flex-col mt-3">
        <DataTable
          data={data.coins.slice(0, 6) || []}
          columns={columns}
          rowKey={(coin) => coin.item.id}
          tableClassName="trending-coins-table"
          headerCellClassName="py-3!"
          bodyCellClassName="py-2!"
        />
      </div>
    </div>
  );
};

export default TrendingCoins;