'use client';

import { useMemo } from 'react';
import { useCoins } from '@/lib/hooks/useCoins';
import { useCryptoStore } from '@/lib/store/useCryptoStore';
import type { CoinMarket } from '@/types/api';

interface FavoriteCoin extends CoinMarket {
  isFavorite: true;
}

export function useFavoriteCoins() {
  const favorites = useCryptoStore((state) => state.favorites);
  const { data: coins = [], isLoading, error } = useCoins({
    currency: 'usd',
    perPage: 250,
    page: 1,
    sortBy: 'market_cap_desc',
  });

  const favoriteCoins = useMemo<FavoriteCoin[]>(() => {
    const favoriteIds = new Set(favorites);
    return coins
      .filter((coin) => favoriteIds.has(coin.id))
      .map((coin) => ({ ...coin, isFavorite: true as const }));
  }, [coins, favorites]);

  return {
    favorites,
    favoriteCoins,
    isLoading,
    error,
    count: favorites.length,
  };
}
