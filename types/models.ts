/**
 * UI/view-model level types that are derived from API data.
 * These should NOT mirror external APIs 1:1 – they represent what the UI needs.
 */

import type { OHLCData } from './api';
import type { PredictionMarket } from '@/lib/predictions/types';

// --- Predictions ---

/**
 * Full prediction result as consumed by the UI:
 * combines market data with the (optional) AI-generated explanation.
 */
export type PredictionResult = PredictionMarket;

// --- Charts ---

/**
 * More ergonomic chart point derived from OHLC tuples.
 * Useful when mapping CoinGecko OHLC into a shape chart libraries expect.
 */
export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type ChartData = ChartDataPoint[];

export function ohlcToChartData(ohlc: OHLCData[]): ChartData {
  return ohlc.map(([timestamp, open, high, low, close]) => ({
    timestamp,
    open,
    high,
    low,
    close,
  }));
}

// --- Filtering & sorting ---

export type SortField =
  | 'market_cap'
  | 'price'
  | 'volume'
  | 'name'
  | 'price_change_percentage_24h';

export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  search?: string;
  categoryIds?: string[];
  favoritesOnly?: boolean;
}

export interface SortOptions {
  sortBy: SortField;
  sortOrder: SortOrder;
}

export type Period = 'daily' | 'weekly' | 'monthly' | '3months';
export type LiveInterval = '1s' | '1m';