export const COINGECKO_ENDPOINTS = {
  markets: '/coins/markets',
  trending: '/search/trending',
  categories: '/coins/categories',
  search: '/search',
  coinById: (id: string) => `/coins/${encodeURIComponent(id)}`,
  coinOhlc: (id: string) => `/coins/${encodeURIComponent(id)}/ohlc`,
} as const;
