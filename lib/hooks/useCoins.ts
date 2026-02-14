import { useQuery } from '@tanstack/react-query';
import type { CoinMarket } from '@/types/api';

interface UseCoinsParams {
  currency?: string;
  perPage?: number;
  page?: number;
  sortBy?: 'market_cap_desc' | 'market_cap_asc' | 'volume_desc' | 'volume_asc';
}

async function fetchCoins(params?: UseCoinsParams): Promise<CoinMarket[]> {
  const searchParams = new URLSearchParams({
    vs_currency: params?.currency ?? 'usd',
    per_page: String(params?.perPage ?? 100),
    page: String(params?.page ?? 1),
    order: params?.sortBy ?? 'market_cap_desc',
  });

  const res = await fetch(`/api/coins?${searchParams.toString()}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Failed to fetch coins');
  }
  return res.json();
}

export function useCoins(params?: UseCoinsParams) {
  return useQuery({
    queryKey: ['coins', params],
    queryFn: () => fetchCoins(params),
    staleTime: 5 * 60 * 1000,
  });
}
