import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCoinDetails } from '@/lib/api/cache';
import { coinGeckoClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils';
import CoinChart from '@/components/features/coins/CoinChart';
import CoinImage from '@/components/ui/CoinImage';
import { PriceChangeDisplay } from '@/components/ui/price-change';
import type { CoinDetails, OHLCData } from '@/types/api';
import {
  buildFinancialQuoteJsonLd,
  buildWebPageJsonLd,
  toJsonLdScript,
} from '@/lib/seo/jsonLd';

/** CoinGecko coin ids: lowercase letters, digits, hyphens; length 1–50. */
function isValidCoinId(id: string): boolean {
  return /^[a-z0-9_-]{1,50}$/i.test(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ [key: string]: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!isValidCoinId(id)) {
    return {
      title: 'Coin',
      description: 'Cryptocurrency details, charts, and market data.',
    };
  }

  const coin = await getCoinDetails(id);

  if (!coin) {
    return {
      title: 'Coin not found',
      description: 'The requested coin is unavailable on this API plan.',
    };
  }

  const symbol = coin.symbol.toUpperCase();
  const priceUsd = coin.market_data.current_price?.usd ?? 0;
  const marketCapUsd = coin.market_data.market_cap?.usd ?? 0;

  return {
    title: `${coin.name} (${symbol}) Price, Chart & Market Data`,
    description: `Live ${coin.name} price: $${priceUsd.toLocaleString()}. Market cap: $${marketCapUsd.toLocaleString()}. Track chart and market data on CoinHub.`,
    openGraph: {
      title: `${coin.name} Price - CoinHub`,
      description: `Track ${coin.name} price, chart, market cap, and 24h performance.`,
      images: [coin.image.large],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${coin.name} Price - CoinHub`,
      description: `Live ${coin.name} market data and chart.`,
      images: [coin.image.large],
    },
  };
}

const CoinPage = async ({
  params,
}: {
  params: Promise<{ [key: string]: string }>;
}) => {
  const { id } = await params;

  if (!isValidCoinId(id)) notFound();

  let coin: CoinDetails | null = null;
  let coinOHLCData: OHLCData[] | null = null;

  try {
    [coin, coinOHLCData] = await Promise.all([
      getCoinDetails(id),
      coinGeckoClient.getOHLC(id, 1).catch(() => null),
    ]);
  } catch (err) {
    console.error(`[coins/${id}] Coin fetch failed:`, err instanceof Error ? err.message : err);
    notFound();
  }

  if (!coin) notFound();

  const { market_data: md } = coin;
  const priceChange24h = md.price_change_percentage_24h_in_currency?.usd ?? null;
  const webPageJsonLd = buildWebPageJsonLd(
    `/coins/${id}`,
    `${coin.name} (${coin.symbol.toUpperCase()})`,
    `Live ${coin.name} price, chart, and market data.`,
  );
  const financialQuoteJsonLd = buildFinancialQuoteJsonLd({
    coinId: id,
    coinName: coin.name,
    symbol: coin.symbol,
    priceUsd: md.current_price?.usd ?? 0,
    marketCapUsd: md.market_cap?.usd ?? 0,
    imageUrl: coin.image.large,
  });

  return (
    <main className="container mx-auto  px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(financialQuoteJsonLd) }}
      />
      <Link
        href="/coins"
        className="text-muted-foreground hover:text-foreground text-sm mb-6 inline-block"
      >
        ← Back to all coins
      </Link>

      <header className="flex flex-wrap items-center gap-4 mb-8">
        <CoinImage
          src={coin.image.large}
          alt={coin.name}
          width={64}
          height={64}
          priority
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,1.2fr)_minmax(280px,1fr)] gap-8 mb-8">
        <section className="min-w-0">
          {coinOHLCData?.length ? (
            <CoinChart data={coinOHLCData} coinId={id}>
              <div className="pt-2 flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {coin.name} / {coin.symbol.toUpperCase()}
                </p>
                <p className="text-xl font-semibold tracking-tight">
                  {formatCurrency(md.current_price?.usd ?? 0)}
                </p>
              </div>
            </CoinChart>
          ) : (
            <div className="rounded-lg border border-border bg-muted/20 flex items-center justify-center min-h-[320px] text-muted-foreground text-sm">
              Chart data unavailable
            </div>
          )}
        </section>

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
              <p className="text-xl font-medium">
                <PriceChangeDisplay value={priceChange24h} size="lg" />
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
