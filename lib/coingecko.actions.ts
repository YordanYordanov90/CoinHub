'use server';

import qs from 'query-string';
import type { CoinGeckoErrorBody } from '@/types/api';

const _baseUrl = process.env.COINGECKO_BASE_URL;
const _apiKey = process.env.COINGECKO_API_KEY;
if (!_baseUrl || !_apiKey) throw new Error('Could not get CoinGecko base URL and API key');
const BASE_URL = _baseUrl;
const API_KEY = _apiKey;

/** Default cache (seconds). Higher = fewer requests, stays within free-tier rate limits. */
const DEFAULT_REVALIDATE = 120;

const FETCH_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 1_500;

type QueryParams = Record<string, string | number | boolean | undefined>;

interface PoolData {
  id: string;
  address: string;
  name: string;
  network: string;
}

/** Validates endpoint to prevent path traversal or absolute URLs. */
function validateEndpoint(endpoint: string): string {
  const normalized = endpoint.trim().replace(/^\/+/, '');
  if (!normalized || normalized.startsWith('http') || normalized.includes('..')) {
    throw new Error(`Invalid CoinGecko endpoint: ${endpoint.slice(0, 50)}`);
  }
  return normalized;
}

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = DEFAULT_REVALIDATE,
): Promise<T> {
  const safeEndpoint = validateEndpoint(endpoint);
  const base = BASE_URL.replace(/\/+$/, '');
  const url = qs.stringifyUrl(
    {
      url: `${base}/${safeEndpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const doFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'x-cg-pro-api-key': API_KEY,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        next: { revalidate },
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let response = await doFetch();

  // Retry once on 5xx only; do not retry on 429 (rate limit) to avoid burning quota.
  if (response.status >= 500 && response.status < 600) {
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    response = await doFetch();
  }

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = response.statusText;
    try {
      const errorBody = JSON.parse(text) as CoinGeckoErrorBody;
      errorMessage = errorBody.error ?? errorMessage;
    } catch {
      if (text) errorMessage = text.slice(0, 200);
    }

    throw new Error(
      `CoinGecko API error ${response.status} (${safeEndpoint}): ${errorMessage}`,
    );
  }

  return response.json();
}

/** Pool data changes rarely; cache 5 min to reduce rate-limit pressure. */
const POOL_REVALIDATE = 300;

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
        undefined,
        POOL_REVALIDATE,
      );

      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>(
      '/onchain/search/pools',
      { query: id },
      POOL_REVALIDATE,
    );

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}