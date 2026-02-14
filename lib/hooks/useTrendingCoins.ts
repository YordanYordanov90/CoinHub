import { useQuery } from '@tanstack/react-query';
import type { TrendingResponse } from '@/types/api';

async function fetchTrendingCoins(): Promise<TrendingResponse> {
  const res = await fetch('/api/trending');
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Failed to fetch trending coins');
  }
  return res.json();
}

export function useTrendingCoins() {
  return useQuery({
    queryKey: ['trending-coins'],
    queryFn: fetchTrendingCoins,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
