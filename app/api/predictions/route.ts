import { NextResponse } from 'next/server';
import { getMarkets } from '@/lib/api/cache';
import { buildMarketsFromCoins, getPredictionsForMarkets } from '@/lib/predictions/ai-predictions';

const COINS_PER_PAGE = 15;

/** POST /api/predictions — returns AI prediction markets (CoinGecko + OpenAI). Optional body: { limit?: number }. */
export async function POST(request: Request) {
  try {
    let limit = COINS_PER_PAGE;
    try {
      const body = await request.json();
      if (body && typeof body.limit === 'number' && body.limit > 0 && body.limit <= 50) {
        limit = body.limit;
      }
    } catch {
      // no body or invalid JSON — use default
    }

    const coins = await getMarkets({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    });
    const marketsWithoutPredictions = buildMarketsFromCoins(coins);
    const markets = await getPredictionsForMarkets(marketsWithoutPredictions);
    return NextResponse.json(markets);
  } catch (error) {
    console.error('[api/predictions]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch predictions' },
      { status: 500 },
    );
  }
}

/** GET /api/predictions — same as POST for convenience (e.g. server components can fetch). */
export async function GET() {
  try {
    const coins = await getMarkets({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: COINS_PER_PAGE,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    });
    const marketsWithoutPredictions = buildMarketsFromCoins(coins);
    const markets = await getPredictionsForMarkets(marketsWithoutPredictions);
    return NextResponse.json(markets);
  } catch (error) {
    console.error('[api/predictions]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch predictions' },
      { status: 500 },
    );
  }
}
