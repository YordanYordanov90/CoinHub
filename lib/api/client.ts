/**
 * Centralized CoinGecko API client.
 * Server-side only: uses COINGECKO_BASE_URL and COINGECKO_API_KEY (no NEXT_PUBLIC_).
 * Demo plan: auth via query param. Pro plan: auth via x-cg-pro-api-key header.
 */

import qs from 'query-string';

// --- Environment and config ---

const _baseUrl = process.env.COINGECKO_BASE_URL;
const _apiKey = process.env.COINGECKO_API_KEY;

if (!_baseUrl || !_apiKey) {
  throw new Error('CoinGeckoClient: COINGECKO_BASE_URL and COINGECKO_API_KEY must be set');
}

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;

/** Demo API uses api.coingecko.com and query param; Pro uses pro-api and header. */
const IS_DEMO =
  _baseUrl.includes('api.coingecko.com') && !_baseUrl.includes('pro-api');

const isDev = process.env.NODE_ENV === 'development';

// --- Response types (align with CoinGecko API and existing types.d.ts) ---

export interface CoinGeckoErrorBody {
  error?: string;
  message?: string;
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface TrendingCoinItem {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  data: {
    price: number;
    price_change_percentage_24h: { usd: number };
  };
}

export interface TrendingCoinEntry {
  item: TrendingCoinItem;
}

export interface TrendingResponse {
  coins: TrendingCoinEntry[];
}

export interface CoinDetailsData {
  id: string;
  name: string;
  symbol: string;
  asset_platform_id?: string | null;
  detail_platforms?: Record<
    string,
    { geckoterminal_url: string; contract_address: string }
  >;
  image: { large: string; small: string };
  market_data: {
    current_price: { usd: number; [key: string]: number };
    price_change_24h_in_currency: { usd: number };
    price_change_percentage_24h_in_currency: { usd: number };
    price_change_percentage_30d_in_currency: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
  };
  market_cap_rank: number;
  description: { en: string };
  links: { homepage: string[]; blockchain_site: string[]; subreddit_url: string };
  tickers: unknown[];
}

export interface CategoryData {
  category_id: string;
  name: string;
  top_3_coins: string[];
  market_cap_change_24h: number;
  market_cap: number;
  volume_24h: number;
}

export interface SearchResultCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

export interface SearchResponse {
  coins: Array<{
    id: string;
    name: string;
    api_symbol: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
    large: string;
  }>;
}

export interface SearchResult {
  coins: SearchResultCoin[];
  error?: string;
}

/** [timestamp_ms, open, high, low, close] */
export type OHLCData = [number, number, number, number, number];

// --- Client class ---

export class CoinGeckoClient {
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor() {
    this.baseURL = _baseUrl.replace(/\/+$/, '');
    this.apiKey = _apiKey;
  }

  /**
   * Request interceptor: log in development only.
   */
  private log(method: string, path: string, status?: number): void {
    if (isDev) {
      const statusPart = status !== undefined ? ` ${status}` : '';
      console.log(`[CoinGecko] ${method} ${path}${statusPart}`);
    }
  }

  /**
   * Private request helper: timeout, retries with exponential backoff, typed response.
   */
  private async request<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const normalized = endpoint.trim().replace(/^\/+/, '');
    if (!normalized || normalized.startsWith('http') || normalized.includes('..')) {
      throw new Error(`Invalid CoinGecko endpoint: ${endpoint.slice(0, 50)}`);
    }

    const query: Record<string, string> = { ...this.stringifyParams(params) };
    if (IS_DEMO) {
      query.x_cg_demo_api_key = this.apiKey;
    }

    const url = qs.stringifyUrl(
      { url: `${this.baseURL}/${normalized}`, query },
      { skipEmptyString: true, skipNull: true },
    );

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (!IS_DEMO) {
      headers['x-cg-pro-api-key'] = this.apiKey;
    }

    this.log('GET', normalized);

    let lastError: Error | null = null;
    let delayMs = INITIAL_RETRY_DELAY_MS;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(url, {
          signal: controller.signal,
          headers,
        });

        clearTimeout(timeoutId);
        this.log('GET', normalized, response.status);

        if (!response.ok) {
          const text = await response.text();
          let message = response.statusText;
          try {
            const body = JSON.parse(text) as CoinGeckoErrorBody;
            message = body.error ?? body.message ?? message;
          } catch {
            if (text) message = text.slice(0, 200);
          }

          if (response.status === 429) {
            throw new Error(`CoinGecko rate limit (429): ${message}`);
          }
          if (response.status === 401) {
            throw new Error(`CoinGecko invalid API key (401): ${message}`);
          }
          if (response.status === 404) {
            throw new Error(`CoinGecko not found (404): ${message}`);
          }
          throw new Error(`CoinGecko API error ${response.status}: ${message}`);
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const isRetryable =
          lastError.name === 'AbortError' ||
          (lastError.message.includes('500') || lastError.message.includes('502') || lastError.message.includes('503'));
        if (attempt < MAX_RETRIES && isRetryable) {
          await new Promise((r) => setTimeout(r, delayMs));
          delayMs *= 2;
          continue;
        }
        throw lastError;
      }
    }

    throw lastError ?? new Error('CoinGecko request failed');
  }

  private stringifyParams(
    params?: Record<string, string | number | boolean | undefined>,
  ): Record<string, string> {
    if (!params) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      out[k] = String(v);
    }
    return out;
  }

  // --- Public API methods ---

  getMarkets(params?: {
    vs_currency?: string;
    per_page?: number;
    page?: number;
    order?: string;
    sparkline?: boolean;
    price_change_percentage?: string;
  }): Promise<CoinMarketData[]> {
    return this.request<CoinMarketData[]>('/coins/markets', {
      vs_currency: params?.vs_currency ?? 'usd',
      order: params?.order ?? 'market_cap_desc',
      per_page: params?.per_page ?? 250,
      page: params?.page ?? 1,
      sparkline: params?.sparkline ?? false,
      price_change_percentage: params?.price_change_percentage ?? '24h',
    });
  }

  getTrendingCoins(): Promise<TrendingResponse> {
    return this.request<TrendingResponse>('/search/trending');
  }

  getCoinDetails(id: string): Promise<CoinDetailsData> {
    const safeId = id.trim();
    if (!/^[a-z0-9_-]{1,50}$/i.test(safeId)) {
      throw new Error(`Invalid coin id: ${id.slice(0, 50)}`);
    }
    return this.request<CoinDetailsData>(`/coins/${encodeURIComponent(safeId)}`);
  }

  getCategories(): Promise<CategoryData[]> {
    return this.request<CategoryData[]>('/coins/categories');
  }

  /**
   * Search coins. Returns same shape as coingecko.server fetchSearch for consistency.
   */
  async searchCoins(query: string): Promise<SearchResult> {
    const trimmed = query.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      return { coins: [] };
    }
    try {
      const body = await this.request<SearchResponse>('/search', { query: trimmed });
      const coins = body.coins ?? [];
      return {
        coins: coins.map((c) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          market_cap_rank: c.market_cap_rank ?? null,
          thumb: c.thumb,
          large: c.large,
        })),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('429')) {
        return { coins: [], error: 'Rate limit reached. Try again in a moment.' };
      }
      if (message.includes('401') || message.includes('403') || message.includes('400')) {
        return { coins: [], error: 'Search unavailable. Check your API plan and key.' };
      }
      throw err;
    }
  }

  getOHLC(id: string, days: number): Promise<OHLCData[]> {
    const safeId = id.trim();
    if (!/^[a-z0-9_-]{1,50}$/i.test(safeId)) {
      throw new Error(`Invalid coin id: ${id.slice(0, 50)}`);
    }
    const validDays = [1, 7, 14, 30].includes(days) ? days : 1;
    return this.request<OHLCData[]>(`/coins/${encodeURIComponent(safeId)}/ohlc`, {
      vs_currency: 'usd',
      days: validDays,
    });
  }
}

/** Singleton instance for server-side use (API routes, server components, server actions). */
export const coinGeckoClient = new CoinGeckoClient();
