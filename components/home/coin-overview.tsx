import { fetcher } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import CandlestickChart from '../candlestick-chart';
import { CoinOverviewFallback } from './fallback';

const COIN_ID = 'bitcoin';

const CoinOverview = async () => {
  let coin: CoinDetailsData | null = null;
  let coinOHLCData: OHLCData[] | null = null;

  try {
    [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>(`/coins/${COIN_ID}`),
      fetcher<OHLCData[]>(
        `/coins/${COIN_ID}/ohlc`,
        { vs_currency: 'usd', days: '1' },
        300,
      ),
    ]);
  } catch (error) {
    console.error('Error fetching coin overview:', error);
  }

  if (!coin || !coinOHLCData) {
    return <CoinOverviewFallback />;
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col">
        <CandlestickChart data={coinOHLCData} coinId={COIN_ID}>
        <div className="pt-2 flex items-center gap-3">
          <Image
            src={coin.image.large}
            alt={coin.name}
            width={48}
            height={48}
            className="shrink-0 rounded-full"
          />
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {formatCurrency(coin.market_data.current_price.usd)}
            </h1>
          </div>
        </div>
      </CandlestickChart>
      </div>
    </div>
  );
};

export default CoinOverview;
