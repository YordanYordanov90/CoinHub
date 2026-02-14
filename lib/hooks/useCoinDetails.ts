import { useQuery } from '@tanstack/react-query';
import type { CoinDetails } from '@/types/api';

async function fetchCoinDetails(coinId: string): Promise<CoinDetails> {
  const res = await fetch(`/api/coins/${encodeURIComponent(coinId)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Failed to fetch coin details');
  }
  return res.json();
}

export function useCoinDetails(coinId?: string) {
  return useQuery({
    queryKey: ['coin-details', coinId],
    queryFn: () => fetchCoinDetails(coinId as string),
    enabled: Boolean(coinId),
  });
}
