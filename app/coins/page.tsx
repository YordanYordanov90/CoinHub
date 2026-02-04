import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import Link from 'next/link';

import { cn, formatPercentage, formatCurrency } from '@/lib/utils';
import DataTable from '@/components/data-table';
import CoinsPagination from '@/components/coins-pagination';


/** Free/Demo tier only accepts page=1 for /coins/markets. Fetch once, paginate in-app. */
const COINS_PAGE_SIZE = 250;
const PER_PAGE = 10;

const Coins = async ({ searchParams }: NextPageProps) => {
  const { page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);

  /** Always request page=1; Demo API returns 400 for page > 1. Cache 3 min. */
  const allCoins = await fetcher<CoinMarketData[]>(
    '/coins/markets',
    {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: COINS_PAGE_SIZE,
      page: 1,
      sparkline: 'false',
      price_change_percentage: '24h',
    },
    180,
  );

  const totalPages = Math.max(1, Math.ceil(allCoins.length / PER_PAGE));
  const pageIndex = Math.min(currentPage - 1, totalPages - 1);
  const coinsData = allCoins.slice(pageIndex * PER_PAGE, (pageIndex + 1) * PER_PAGE);

  const columns: DataTableColumn<CoinMarketData>[] = [
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
          <Image src={coin.image} alt={coin.name} width={36} height={36} />
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
      cell: (coin) => {
        const isTrendingUp = coin.price_change_percentage_24h > 0;

        return (
          <span
            className={cn('change-value', {
              'text-green-600': isTrendingUp,
              'text-red-500': !isTrendingUp,
            })}
          >
            {isTrendingUp && '+'}
            {formatPercentage(coin.price_change_percentage_24h)}
          </span>
        );
      },
    },
    {
      header: 'Market Cap',
      cellClassName: 'market-cap-cell',
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  const hasMorePages = currentPage < totalPages;

  return (
    <main className='container mx-auto  px-4 sm:px-6 py-8'  >
      <div className="content">
        <h4>All Coins</h4>

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
      </div>
    </main>
  );
};

export default Coins;