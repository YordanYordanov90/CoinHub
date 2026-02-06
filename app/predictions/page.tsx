import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { fetcher } from '@/lib/coingecko.actions';
import { buildMarketsFromCoins, getPredictionsForMarkets } from '@/lib/predictions/ai-predictions';
import PredictionMarketCard from '@/components/predictions/market-card';

const COINS_PER_PAGE = 15;
const COINGECKO_REVALIDATE = 300;
/** Cache full page data (CoinGecko + OpenAI) so repeat visits are instant. */
const PREDICTIONS_CACHE_SECONDS = 600;

function RateLimitMessage() {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-6 text-center">
      <p className="font-medium text-foreground">CoinGecko rate limit reached</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Too many requests in a short time. Wait a minute and try again, or visit another page and come back.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to Home
      </Link>
    </div>
  );
}

async function fetchPredictionsData(): Promise<Awaited<ReturnType<typeof getPredictionsForMarkets>>> {
  const coins = await fetcher<CoinMarketData[]>(
    '/coins/markets',
    {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: COINS_PER_PAGE,
      page: 1,
      sparkline: 'false',
      price_change_percentage: '24h',
    },
    COINGECKO_REVALIDATE,
  );
  const marketsWithoutPredictions = buildMarketsFromCoins(coins);
  return getPredictionsForMarkets(marketsWithoutPredictions);
}

const getCachedPredictions = unstable_cache(
  fetchPredictionsData,
  ['predictions-page'],
  { revalidate: PREDICTIONS_CACHE_SECONDS },
);

export default async function PredictionsPage() {
  let markets: Awaited<ReturnType<typeof getPredictionsForMarkets>>;

  try {
    markets = await getCachedPredictions();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('429') || message.includes('Too Many Requests')) {
      return (
        <main className="container mx-auto min-w-0 px-4 sm:px-6 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              AI Prediction Markets
            </h1>
          </header>
          <RateLimitMessage />
        </main>
      );
    }
    throw err;
  }

  return (
    <main className="container mx-auto min-w-0 px-4 sm:px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          AI Prediction Markets
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Short AI-generated outlooks based on current market data. Not financial advice.
        </p>
      </header>

      {markets.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <li key={market.coinId}>
              <PredictionMarketCard market={market} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground">No prediction markets available.</p>
      )}
    </main>
  );
}
