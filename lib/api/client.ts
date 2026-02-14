/**
 * Centralized CoinGecko API client.
 * Server-side only: uses COINGECKO_BASE_URL and COINGECKO_API_KEY (no NEXT_PUBLIC_).
 * Demo plan: auth via query param. Pro plan: auth via x-cg-pro-api-key header.
 */

import qs from 'query-string';
import { z } from 'zod';
import {
  APIError,
  NetworkError,
  RateLimitError,
  ValidationError,
} from '@/lib/errors';

import {
  CategorySchema,
  CoinDetailsSchema,
  CoinGeckoErrorBodySchema,
  CoinMarketSchema,
  OHLCDataSchema,
  SearchResponseSchema,
  TrendingResponseSchema,
  type Category,
  type CoinDetails,
  type CoinMarket,
  type OHLCData,
  type SearchResponse,
  type SearchResult,
  type TrendingResponse,
} from '@/types/api';

// --- Environment and config ---

const _baseUrl = process.env.COINGECKO_BASE_URL;
const _apiKey = process.env.COINGECKO_API_KEY;

if (!_baseUrl || !_apiKey) {
  throw new Error('CoinGeckoClient: COINGECKO_BASE_URL and COINGECKO_API_KEY must be set');
}

/** Narrowed so TypeScript knows they are defined after the guard. */
const BASE_URL: string = _baseUrl;
const API_KEY: string = _apiKey;

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;

/** Demo API uses api.coingecko.com and query param; Pro uses pro-api and header. */
const IS_DEMO =
  BASE_URL.includes('api.coingecko.com') && !BASE_URL.includes('pro-api');

const isDev = process.env.NODE_ENV === 'development';

// --- Client class ---

export class CoinGeckoClient {
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor() {
    this.baseURL = BASE_URL.replace(/\/+$/, '');
    this.apiKey = API_KEY;
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
   * If a Zod schema is provided, the JSON is validated before returning.
   */
  private async request<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    schema?: z.ZodType<T>,
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
            const body = CoinGeckoErrorBodySchema.parse(
              JSON.parse(text),
            );
            message = body.error ?? body.message ?? message;
          } catch {
            if (text) message = text.slice(0, 200);
          }

          if (response.status === 429) {
            throw new RateLimitError(`CoinGecko rate limit: ${message}`);
          }
          if (response.status === 401) {
            throw new APIError(
              `CoinGecko invalid API key: ${message}`,
              401,
              true,
              'UNAUTHORIZED',
            );
          }
          if (response.status === 404) {
            throw new APIError(`CoinGecko not found: ${message}`, 404, true, 'NOT_FOUND');
          }
          if (response.status >= 500) {
            throw new APIError(
              `CoinGecko upstream server error ${response.status}: ${message}`,
              503,
              true,
              'UPSTREAM_SERVER_ERROR',
            );
          }
          throw new APIError(
            `CoinGecko API error ${response.status}: ${message}`,
            response.status,
            true,
            'UPSTREAM_API_ERROR',
          );
        }

        const json = (await response.json()) as unknown;

        if (schema) {
          try {
            return schema.parse(json);
          } catch (validationError) {
            if (isDev) {
              
              console.error(
                '[CoinGecko] Response validation failed:',
                validationError,
              );
            }
            if (validationError instanceof z.ZodError) {
              throw new ValidationError(
                'CoinGecko response validation failed',
                validationError.issues,
              );
            }
            throw validationError;
          }
        }

        return json as T;
      } catch (err) {
        if (err instanceof APIError) {
          lastError = err;
        } else if (err instanceof z.ZodError) {
          lastError = new ValidationError(
            'CoinGecko response validation failed',
            err.issues,
          );
        } else if (err instanceof Error && err.name === 'AbortError') {
          lastError = new NetworkError('CoinGecko request timeout');
        } else {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
        const isRetryable =
          lastError instanceof NetworkError ||
          (lastError instanceof APIError &&
            (lastError.code === 'UPSTREAM_SERVER_ERROR' || lastError.code === 'NETWORK_ERROR')) ||
          (lastError.message.includes('500') ||
            lastError.message.includes('502') ||
            lastError.message.includes('503'));
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
  }): Promise<CoinMarket[]> {
    return this.request<CoinMarket[]>(
      '/coins/markets',
      {
        vs_currency: params?.vs_currency ?? 'usd',
        order: params?.order ?? 'market_cap_desc',
        per_page: params?.per_page ?? 250,
        page: params?.page ?? 1,
        sparkline: params?.sparkline ?? false,
        price_change_percentage: params?.price_change_percentage ?? '24h',
      },
      CoinMarketSchema.array(),
    );
  }

  getTrendingCoins(): Promise<TrendingResponse> {
    return this.request<TrendingResponse>(
      '/search/trending',
      undefined,
      TrendingResponseSchema,
    );
  }

  getCoinDetails(id: string): Promise<CoinDetails> {
    const safeId = id.trim();
    if (!/^[a-z0-9_-]{1,50}$/i.test(safeId)) {
      throw new Error(`Invalid coin id: ${id.slice(0, 50)}`);
    }
    return this.request<CoinDetails>(
      `/coins/${encodeURIComponent(safeId)}`,
      undefined,
      CoinDetailsSchema,
    );
  }

  getCategories(): Promise<Category[]> {
    return this.request<Category[]>(
      '/coins/categories',
      undefined,
      CategorySchema.array(),
    );
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
      const body = await this.request<SearchResponse>(
        '/search',
        { query: trimmed },
        SearchResponseSchema,
      );
      const coins = body.coins ?? [];
      const result: SearchResult = {
        coins: coins.map((c) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          market_cap_rank: c.market_cap_rank ?? null,
          thumb: c.thumb,
          large: c.large,
        })),
      };
      return result;
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
    return this.request<OHLCData[]>(
      `/coins/${encodeURIComponent(safeId)}/ohlc`,
      {
        vs_currency: 'usd',
        days: validDays,
      },
      OHLCDataSchema.array(),
    );
  }
}

/** Singleton instance for server-side use (API routes, server components, server actions). */
export const coinGeckoClient = new CoinGeckoClient();
