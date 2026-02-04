import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetcher } from '@/lib/coingecko.actions';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import CandlestickChart from '@/components/candlestick-chart';

const CoinPage = async ({ params }: NextPageProps) => {
  const { id } = await params;

  let coin: CoinDetailsData | null = null;
  let coinOHLCData: OHLCData[] | null = null;

  const coinEndpoint = `/coins/${encodeURIComponent(id)}`;

  try {
    [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>(coinEndpoint, undefined, 300),
      fetcher<OHLCData[]>(
        `${coinEndpoint}/ohlc`,
        { vs_currency: 'usd', days: '1' },
        300,
      ).catch(() => null),
    ]);
  } catch (err) {
    // Server log: 400/404 = coin not available or not supported on your API plan for GET /coins/{id}. 404 often means this coin isn’t available on the free/Demo tier for GET /coins/{id}.
    console.error(`[coins/${id}] Coin fetch failed:`, err instanceof Error ? err.message : err);
    notFound();
  }

  if (!coin) notFound();

  const { market_data: md } = coin;
  const priceChange24h = md.price_change_percentage_24h_in_currency?.usd ?? null;

  return (
    <main className="container mx-auto  px-4 sm:px-6 py-8">
      <Link
        href="/coins"
        className="text-muted-foreground hover:text-foreground text-sm mb-6 inline-block"
      >
        ← Back to all coins
      </Link>

      <header className="flex flex-wrap items-center gap-4 mb-8">
        <Image
          src={coin.image.large}
          alt={coin.name}
          width={64}
          height={64}
          className="shrink-0 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {coin.name} ({coin.symbol.toUpperCase()})
          </h1>
          {coin.market_cap_rank != null && (
            <p className="text-sm text-muted-foreground">Rank #{coin.market_cap_rank}</p>
          )}
        </div>
      </header>

      {/* Desktop: chart left, stats right. Mobile: stacked (chart then stats). */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,1.2fr)_minmax(280px,1fr)] gap-8 mb-8">
        {/* Chart column — full width on small screens, left column on lg+ */}
        <section className="min-w-0">
          {coinOHLCData?.length ? (
            <CandlestickChart data={coinOHLCData} coinId={id}>
              <div className="pt-2 flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {coin.name} / {coin.symbol.toUpperCase()}
                </p>
                <p className="text-xl font-semibold tracking-tight">
                  {formatCurrency(md.current_price?.usd ?? 0)}
                </p>
              </div>
            </CandlestickChart>
          ) : (
            <div className="rounded-lg border border-border bg-muted/20 flex items-center justify-center min-h-[320px] text-muted-foreground text-sm">
              Chart data unavailable
            </div>
          )}
        </section>

        {/* Stats column — full width on small screens, right column on lg+ */}
        <section className="space-y-6 min-w-0">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-xl font-medium">
                {formatCurrency(md.current_price?.usd ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h change</p>
              <p
                className={cn(
                  'text-xl font-medium',
                  priceChange24h != null && priceChange24h >= 0 && 'text-green-600',
                  priceChange24h != null && priceChange24h < 0 && 'text-red-500',
                )}
              >
                {priceChange24h != null ? formatPercentage(priceChange24h) : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market cap</p>
              <p className="text-xl font-medium">
                {formatCurrency(md.market_cap?.usd ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volume (24h)</p>
              <p className="text-xl font-medium">
                {formatCurrency(md.total_volume?.usd ?? 0)}
              </p>
            </div>
          </div>

          {coin.description?.en && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">About</h2>
              <p className="text-foreground/90 text-sm leading-relaxed line-clamp-6">
                {coin.description.en.replace(/<[^>]*>/g, '').slice(0, 500)}
                {coin.description.en.length > 500 ? '…' : ''}
              </p>
            </div>
          )}

          {coin.links?.homepage?.[0] && (
            <div>
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Website →
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default CoinPage;
