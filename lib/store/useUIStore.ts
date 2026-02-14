'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark';
export type CurrencyPreference = 'usd' | 'eur' | 'gbp';
export type TimeRangePreference = '24h' | '7d' | '30d' | '1y';
export type SortByPreference = 'market_cap' | 'price' | 'volume';
export type SortOrderPreference = 'asc' | 'desc';

interface UIStore {
  theme: ThemePreference;
  currency: CurrencyPreference;
  timeRange: TimeRangePreference;
  sortBy: SortByPreference;
  sortOrder: SortOrderPreference;
  setTheme: (theme: ThemePreference) => void;
  setCurrency: (currency: CurrencyPreference) => void;
  setTimeRange: (timeRange: TimeRangePreference) => void;
  setSortBy: (sortBy: SortByPreference) => void;
  setSortOrder: (sortOrder: SortOrderPreference) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      currency: 'usd',
      timeRange: '24h',
      sortBy: 'market_cap',
      sortOrder: 'desc',
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setTimeRange: (timeRange) => set({ timeRange }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
    }),
    {
      name: 'coinhub-ui-store',
    },
  ),
);
