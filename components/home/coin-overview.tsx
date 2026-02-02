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
    <div id="coin-overview">
      <CandlestickChart data={coinOHLCData} coinId={COIN_ID}>
        <div className="header pt-2">
          <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
          <div className="info">
            <p>
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>
            <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
          </div>
        </div>
      </CandlestickChart>
    </div>
  );
};

export default CoinOverview;
