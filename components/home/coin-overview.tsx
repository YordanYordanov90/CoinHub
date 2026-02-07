import { getCoinDetails } from '@/lib/api/cache';
import { coinGeckoClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import CandlestickChart from '../candlestick-chart';
import { CoinOverviewFallback } from './fallback';

const COIN_ID = 'bitcoin';

const CoinOverview = async () => {
  let coin: CoinDetailsData | null = null;
  let coinOHLCData: OHLCData[] | null = null;

  try {
    /** Cached 5 min via lib/api/cache; home hero doesn't need real-time. */
    [coin, coinOHLCData] = await Promise.all([
      getCoinDetails(COIN_ID),
      coinGeckoClient.getOHLC(COIN_ID, 1).catch(() => null),
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
