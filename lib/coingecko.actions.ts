'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

/** Default cache (seconds). Higher = fewer requests, stays within free-tier rate limits. */
const DEFAULT_REVALIDATE = 120;

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = DEFAULT_REVALIDATE,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'x-cg-pro-api-key': API_KEY,
      'Content-Type': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

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
      `CoinGecko API error ${response.status} (${endpoint}): ${errorMessage}`,
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