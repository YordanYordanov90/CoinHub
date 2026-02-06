/**
 * Prediction markets: build markets from CoinGecko data and fetch AI predictions via OpenAI.
 * Server-only: used by the predictions page (Server Component). Do not import from client.
 */

import OpenAI from 'openai';
import type { PredictionMarket } from './types';

const PREDICTION_MARKETS_LIMIT = 6;
const DAYS_UNTIL_END = 30;

/** Builds a target price by applying a random percentage offset to current price (for demo variety). */
function randomTargetPrice(currentPrice: number): number {
  const pct = (Math.random() - 0.5) * 40;
  return Math.round(currentPrice * (1 + pct / 100) * 100) / 100;
}

/** End date string (YYYY-MM-DD) for DAYS_UNTIL_END from now. */
function getEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + DAYS_UNTIL_END);
  return d.toISOString().split('T')[0];
}

export interface CoinMarketInput {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

/**
 * Builds prediction market entries from CoinGecko /coins/markets response.
 * Skips stablecoin-like ids/symbols. Caps at PREDICTION_MARKETS_LIMIT.
 */
export function buildMarketsFromCoins(coins: CoinMarketInput[]): Omit<PredictionMarket, 'aiPrediction'>[] {
  const endDate = getEndDate();
  const filtered = coins.filter(
    (c) => !c.id.includes('usd') && !c.symbol.toLowerCase().includes('usd'),
  );
  return filtered.slice(0, PREDICTION_MARKETS_LIMIT).map((c) => ({
    coinId: c.id,
    name: c.name,
    symbol: c.symbol,
    image: c.image,
    currentPrice: c.current_price,
    targetPrice: randomTargetPrice(c.current_price),
    endDate,
    marketCap: c.market_cap,
    totalVolume: c.total_volume,
    priceChangePercentage24h: c.price_change_percentage_24h ?? 0,
  }));
}

/** Builds a short text summary of a market for the OpenAI prompt. */
function marketSummary(m: Omit<PredictionMarket, 'aiPrediction'>): string {
  return [
    `Coin: ${m.name} (${m.symbol.toUpperCase()})`,
    `Current price: $${m.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}`,
    `24h change: ${m.priceChangePercentage24h.toFixed(2)}%`,
    `Market cap: $${m.marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    `24h volume: $${m.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    `Target price: $${m.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} by ${m.endDate}`,
  ].join('. ');
}

const SYSTEM_PROMPT = `You are a crypto market analyst. Given the following market data, respond with 1–2 sentences only: direction (bullish, bearish, or neutral) and optional price level or caveat. Do not give financial advice. Be concise.`;

/**
 * Fetches AI prediction from OpenAI for one market. Returns null if key missing or request fails.
 */
async function fetchPrediction(
  market: Omit<PredictionMarket, 'aiPrediction'>,
  openai: OpenAI,
): Promise<string | null> {
  const content = marketSummary(market);
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      max_tokens: 150,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text ?? null;
  } catch {
    return null;
  }
}

/**
 * Fills aiPrediction for each market using OpenAI. Runs on the server only.
 * Requires OPENAI_API_KEY in env. If missing or OpenAI errors, predictions stay null.
 * Calls OpenAI in parallel so total time ≈ one round-trip instead of N.
 */
export async function getPredictionsForMarkets(
  markets: Omit<PredictionMarket, 'aiPrediction'>[],
): Promise<PredictionMarket[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return markets.map((m) => ({ ...m, aiPrediction: null }));
  }

  const openai = new OpenAI({ apiKey: key });
  const predictions = await Promise.all(
    markets.map(async (m) => fetchPrediction(m, openai)),
  );

  return markets.map((m, i) => ({
    ...m,
    aiPrediction: predictions[i],
  }));
}
