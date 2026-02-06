/**
 * Types for the predictions page. Reuses CoinGecko market shape where possible.
 */

export interface PredictionMarket {
  coinId: string;
  name: string;
  symbol: string;
  image: string;
  currentPrice: number;
  targetPrice: number;
  endDate: string;
  marketCap: number;
  totalVolume: number;
  priceChangePercentage24h: number;
  /** AI-generated short prediction (1–2 sentences). */
  aiPrediction: string | null;
}
