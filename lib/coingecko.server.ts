/**
 * Server-only CoinGecko helpers for use in Route Handlers and other server code.
 * Not exported to client; no 'use server'.
 *
 * Demo plan: BASE_URL = https://api.coingecko.com/api/v3, auth = query param x_cg_demo_api_key.
 * Pro plan: BASE_URL = https://pro-api.coingecko.com/api/v3, auth = header x-cg-pro-api-key.
 */

import qs from 'query-string';
import type { SearchResultCoin } from '@/types/api';

const _baseUrl = process.env.COINGECKO_BASE_URL;
const _apiKey = process.env.COINGECKO_API_KEY;
if (!_baseUrl || !_apiKey) throw new Error('Could not get CoinGecko base URL and API key');
const BASE_URL = _baseUrl;
const API_KEY = _apiKey;

/** Demo API uses api.coingecko.com and query param; Pro uses pro-api.coingecko.com and header. */
const IS_DEMO = BASE_URL.includes('api.coingecko.com') && !BASE_URL.includes('pro-api');

const FETCH_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 1_500;

interface CoinGeckoSearchResponse {
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

/** Fetches CoinGecko /search. On 400/429 returns empty coins + message instead of throwing. */
export async function fetchSearch(query: string): Promise<SearchResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { coins: [] };
  }
  const base = BASE_URL.replace(/\/+$/, '');
  const queryParams: Record<string, string> = { query: trimmed };
  if (IS_DEMO) {
    queryParams.x_cg_demo_api_key = API_KEY;
  }
  const url = qs.stringifyUrl(
    { url: `${base}/search`, query: queryParams },
    { skipEmptyString: true, skipNull: true },
  );

  const doFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (!IS_DEMO) {
        headers['x-cg-pro-api-key'] = API_KEY;
      }
      return await fetch(url, {
        signal: controller.signal,
        headers,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let response = await doFetch();
  if (response.status >= 500 && response.status < 600) {
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    response = await doFetch();
  }

  if (!response.ok) {
    const status = response.status;
    const text = await response.text();
    let message = response.statusText;
    try {
      const errorBody = JSON.parse(text) as { error?: string; message?: string };
      message = errorBody.error ?? errorBody.message ?? message;
    } catch {
      if (text) message = text.slice(0, 200);
    }
    if (status === 429) {
      return { coins: [], error: 'Rate limit reached. Try again in a moment.' };
    }
    if (status === 400 || status === 401 || status === 403) {
      return { coins: [], error: 'Search unavailable. Check your API plan and key.' };
    }
    throw new Error(`CoinGecko search error ${status}: ${message}`);
  }

  const body = (await response.json()) as CoinGeckoSearchResponse;
  const coins = body.coins ?? [];
  return {
    coins: coins.map((c) => ({
      id: c.id,
      name: c.name,
      api_symbol: c.api_symbol,
      symbol: c.symbol,
      market_cap_rank: c.market_cap_rank ?? null,
      thumb: c.thumb,
      large: c.large,
    })),
  };
}
