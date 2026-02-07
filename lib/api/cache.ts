/**
 * Centralized API caching for CoinGecko data.
 * Uses Next.js unstable_cache; server-side only. Wraps coinGeckoClient.
 * Revalidation: 300 seconds (5 minutes) for market data.
 */

import { unstable_cache } from 'next/cache';
import { coinGeckoClient } from './client';
import type {
  CoinMarketData,
  TrendingResponse,
  CoinDetailsData,
  CategoryData,
} from './client';

const REVALIDATE_SECONDS = 300;

// --- getMarkets ---

async function fetchMarkets(params: {
  vs_currency: string;
  per_page: number;
  page: number;
  order: string;
  sparkline: boolean;
  price_change_percentage: string;
}): Promise<CoinMarketData[]> {
  return coinGeckoClient.getMarkets(params);
}

export async function getMarkets(params?: {
  vs_currency?: string;
  per_page?: number;
  page?: number;
  order?: string;
  sparkline?: boolean;
  price_change_percentage?: string;
}): Promise<CoinMarketData[]> {
  const vsCurrency = params?.vs_currency ?? 'usd';
  const perPage = params?.per_page ?? 250;
  const page = params?.page ?? 1;
  const order = params?.order ?? 'market_cap_desc';
  const sparkline = params?.sparkline ?? false;
  const priceChange = params?.price_change_percentage ?? '24h';

  try {
    const cached = unstable_cache(
      () =>
        fetchMarkets({
          vs_currency: vsCurrency,
          per_page: perPage,
          page,
          order,
          sparkline,
          price_change_percentage: priceChange,
        }),
      ['coins-markets', vsCurrency, String(perPage), String(page)],
      { revalidate: REVALIDATE_SECONDS },
    );
    return await cached();
  } catch (error) {
    console.error('[cache] getMarkets failed:', error);
    return [];
  }
}

// --- getTrendingCoins ---

async function fetchTrending(): Promise<TrendingResponse> {
  return coinGeckoClient.getTrendingCoins();
}

export async function getTrendingCoins(): Promise<TrendingResponse> {
  try {
    const cached = unstable_cache(fetchTrending, ['search', 'trending'], {
      revalidate: REVALIDATE_SECONDS,
    });
    return await cached();
  } catch (error) {
    console.error('[cache] getTrendingCoins failed:', error);
    return { coins: [] };
  }
}

// --- getCoinDetails ---

async function fetchCoinDetails(id: string): Promise<CoinDetailsData> {
  return coinGeckoClient.getCoinDetails(id);
}

export async function getCoinDetails(id: string): Promise<CoinDetailsData | null> {
  const safeId = id.trim();
  if (!/^[a-z0-9_-]{1,50}$/i.test(safeId)) {
    return null;
  }
  try {
    const cached = unstable_cache(
      () => fetchCoinDetails(safeId),
      ['coins', safeId],
      { revalidate: REVALIDATE_SECONDS },
    );
    return await cached();
  } catch (error) {
    console.error('[cache] getCoinDetails failed:', safeId, error);
    return null;
  }
}

// --- getCategories ---

async function fetchCategories(): Promise<CategoryData[]> {
  return coinGeckoClient.getCategories();
}

export async function getCategories(): Promise<CategoryData[]> {
  try {
    const cached = unstable_cache(fetchCategories, ['coins', 'categories'], {
      revalidate: REVALIDATE_SECONDS,
    });
    return await cached();
  } catch (error) {
    console.error('[cache] getCategories failed:', error);
    return [];
  }
}
