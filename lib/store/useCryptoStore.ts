'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CryptoStore {
  favorites: string[];
  addFavorite: (coinId: string) => void;
  removeFavorite: (coinId: string) => void;
  toggleFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
  clearFavorites: () => void;
}

export const useCryptoStore = create<CryptoStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (coinId) =>
        set((state) => ({
          favorites: state.favorites.includes(coinId)
            ? state.favorites
            : [...state.favorites, coinId],
        })),
      removeFavorite: (coinId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== coinId),
        })),
      toggleFavorite: (coinId) =>
        set((state) => ({
          favorites: state.favorites.includes(coinId)
            ? state.favorites.filter((id) => id !== coinId)
            : [...state.favorites, coinId],
        })),
      isFavorite: (coinId) => get().favorites.includes(coinId),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'coinhub-crypto-store',
    },
  ),
);
