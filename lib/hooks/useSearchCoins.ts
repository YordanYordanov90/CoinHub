import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SearchResult } from '@/types/api';

const SEARCH_DEBOUNCE_MS = 500;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

async function fetchSearchCoins(query: string): Promise<SearchResult> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Failed to search coins');
  }
  return res.json();
}

export function useSearchCoins(query: string, enabled = true) {
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, SEARCH_DEBOUNCE_MS);
  const canSearch = enabled && debouncedQuery.length >= 2;

  return useQuery({
    queryKey: ['search-coins', debouncedQuery],
    queryFn: () => fetchSearchCoins(debouncedQuery),
    enabled: canSearch,
    staleTime: 30 * 1000,
  });
}
