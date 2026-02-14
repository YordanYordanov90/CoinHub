import type { Metadata } from 'next';
import Categories from '@/components/features/categories/CategoryList';
import CoinOverview from '@/components/home/coin-overview';
import CryptopanicWidget from '@/components/home/cryptopanic-widget';
import {
  CategoriesFallback,
  CoinOverviewFallback,
  CryptopanicWidgetFallback,
  TrendingCoinsFallback,
} from '@/components/home/fallback';
import TrendingCoins from '@/components/home/trending-coins';
import { getTrendingCoins } from '@/lib/api/cache';
import {
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
  toJsonLdScript,
} from '@/lib/seo/jsonLd';
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const fallbackDescription =
    'Live cryptocurrency overview with trending coins, categories, and market insights.';

  try {
    const trending = await getTrendingCoins();
    const topNames = trending.coins.slice(0, 3).map((coin) => coin.item.name);
    const description =
      topNames.length > 0
        ? `Track trending coins like ${topNames.join(', ')} and monitor live crypto market movements.`
        : fallbackDescription;

    return {
      title: 'Home',
      description,
      openGraph: {
        title: 'CoinHub | Live Crypto Market Overview',
        description,
        images: ['/next.svg'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'CoinHub | Live Crypto Market Overview',
        description,
        images: ['/next.svg'],
      },
    };
  } catch {
    return {
      title: 'Home',
      description: fallbackDescription,
    };
  }
}

const HomePage = async () => {
  const webSiteJsonLd = buildWebSiteJsonLd();
  const webPageJsonLd = buildWebPageJsonLd(
    '/',
    'CoinHub',
    'Live cryptocurrency overview with trending coins, categories, and market insights.',
  );

  return (
    <main className="min-h-screen container mx-auto min-w-0 overflow-x-hidden bg-linear-to-r text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(webPageJsonLd) }}
      />
      <div className="container mx-auto min-w-0 max-w-full px-4 sm:px-6 py-8 gap-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] md:items-stretch">
        <section className="mb-8 md:mb-0 flex min-h-0 flex-col md:h-full">
          <Suspense fallback={<CoinOverviewFallback />}>
            <CoinOverview />
          </Suspense>
        </section>
        <section className="mb-8 md:mb-0 flex min-h-0 flex-col md:h-full">
          <Suspense fallback={<TrendingCoinsFallback />}>
            <TrendingCoins />
          </Suspense>
        </section>
      </div>
      <section className="container mx-auto min-w-0 max-w-full px-4 sm:px-6 py-8">
        <Suspense fallback={<CryptopanicWidgetFallback />}>
          <CryptopanicWidget />
        </Suspense>
      </section>
      <section className="container mx-auto min-w-0 max-w-full px-4 sm:px-6 py-8">
        <Suspense fallback={<CategoriesFallback />}>
          <Categories />
        </Suspense>
      </section>
    </main>
  );
};

export default HomePage;
