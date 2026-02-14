import { z } from 'zod';

/**
 * Zod schemas and types for all external API responses (primarily CoinGecko).
 * These are the single source of truth for API shapes.
 */

// --- Shared primitives ---

export const OHLCDataSchema = z.tuple([
  z.number(), // timestamp (ms)
  z.number(), // open
  z.number(), // high
  z.number(), // low
  z.number(), // close
]);

export type OHLCData = z.infer<typeof OHLCDataSchema>;

// --- Markets (/coins/markets) ---

export const CoinMarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url(),
  current_price: z.number(),
  market_cap: z.number(),
  market_cap_rank: z.number().nullable(),
  fully_diluted_valuation: z.number().nullable(),
  total_volume: z.number(),
  high_24h: z.number(),
  low_24h: z.number(),
  price_change_24h: z.number(),
  price_change_percentage_24h: z.number().nullable(),
  market_cap_change_24h: z.number(),
  market_cap_change_percentage_24h: z.number(),
  circulating_supply: z.number(),
  total_supply: z.number().nullable(),
  max_supply: z.number().nullable(),
  ath: z.number(),
  ath_change_percentage: z.number(),
  ath_date: z.string(),
  atl: z.number(),
  atl_change_percentage: z.number(),
  atl_date: z.string(),
  last_updated: z.string(),
});

export type CoinMarket = z.infer<typeof CoinMarketSchema>;

// --- Trending (/search/trending) ---

export const TrendingCoinItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  market_cap_rank: z.number(),
  thumb: z.string().url(),
  large: z.string().url(),
  data: z.object({
    price: z.number(),
    price_change_percentage_24h: z.object({
      usd: z.number(),
    }),
  }),
});

export const TrendingCoinSchema = z.object({
  item: TrendingCoinItemSchema,
});

export const TrendingResponseSchema = z.object({
  coins: z.array(TrendingCoinSchema),
});

export type TrendingCoin = z.infer<typeof TrendingCoinSchema>;
export type TrendingResponse = z.infer<typeof TrendingResponseSchema>;

// --- Tickers (subset used in the app) ---

export const CoinGeckoTickerSchema = z.object({
  market: z.object({
    name: z.string(),
  }),
  base: z.string(),
  target: z.string(),
  converted_last: z.object({
    usd: z.number(),
  }),
  timestamp: z.string(),
  trade_url: z.string().url().nullable(),
});

export type CoinGeckoTicker = z.infer<typeof CoinGeckoTickerSchema>;

// --- Coin details (/coins/{id}) ---

export const CoinDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  asset_platform_id: z.string().nullable().optional(),
  detail_platforms: z
    .record(
      z.string(),
      z.object({
        geckoterminal_url: z.string().url().catch(''),
        contract_address: z.string().catch(''),
      }),
    )
    .optional(),
  image: z.object({
    large: z.string().url(),
    small: z.string().url(),
  }),
  market_data: z.object({
    current_price: z
      .object({
        usd: z.number(),
      })
      .catchall(z.number()),
    price_change_24h_in_currency: z
      .object({
        usd: z.number(),
      })
      .catchall(z.number()),
    price_change_percentage_24h_in_currency: z
      .object({
        usd: z.number(),
      })
      .catchall(z.number()),
    price_change_percentage_30d_in_currency: z
      .object({
        usd: z.number(),
      })
      .catchall(z.number()),
    market_cap: z
      .object({
        usd: z.number(),
      })
      .catchall(z.number()),
    total_volume: z
      .object({
        usd: z.number(),
      })
      .catchall(z.number()),
  }),
  market_cap_rank: z.number(),
  description: z.object({
    en: z.string(),
  }),
  links: z.object({
    homepage: z.array(z.string().url()).optional(),
    blockchain_site: z.array(z.string()).optional(),
    subreddit_url: z.string().optional(),
  }),
  tickers: z.array(CoinGeckoTickerSchema),
});

export type CoinDetails = z.infer<typeof CoinDetailsSchema>;

// --- Categories (/coins/categories) ---

export const CategorySchema = z.object({
  category_id: z.string().optional().transform((v) => v ?? ''),
  name: z.string(),
  top_3_coins: z.array(z.string()).optional().transform((v) => v ?? []),
  market_cap_change_24h: z.number().nullable().transform((v) => v ?? 0),
  market_cap: z.number().nullable().transform((v) => v ?? 0),
  volume_24h: z.number().nullable().transform((v) => v ?? 0),
});

export type Category = z.infer<typeof CategorySchema>;

// --- Search (/search) ---

export const SearchResultCoinSchema = z.object({
  id: z.string(),
  name: z.string(),
  api_symbol: z.string(),
  symbol: z.string(),
  market_cap_rank: z.number().nullable(),
  thumb: z.string().url(),
  large: z.string().url(),
});

export const SearchResponseSchema = z.object({
  coins: z.array(SearchResultCoinSchema),
});

export type SearchResultCoin = z.infer<typeof SearchResultCoinSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const SearchResultSchema = z.object({
  coins: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      symbol: z.string(),
      market_cap_rank: z.number().nullable(),
      thumb: z.string().url(),
      large: z.string().url(),
    }),
  ),
  error: z.string().optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// --- Error body helpers (non-throwing parse) ---

export const CoinGeckoErrorBodySchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
});

export type CoinGeckoErrorBody = z.infer<typeof CoinGeckoErrorBodySchema>;

