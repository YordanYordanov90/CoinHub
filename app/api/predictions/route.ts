import { NextResponse } from 'next/server';
import { getMarkets } from '@/lib/api/cache';
import { buildMarketsFromCoins, getPredictionsForMarkets } from '@/lib/predictions/ai-predictions';
import { handleAPIError, logError } from '@/lib/errors/handler';

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
    const marketsWithoutPredictions = buildMarketsFromCoins(
      coins.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        image: c.image,
        current_price: c.current_price,
        market_cap: c.market_cap,
        total_volume: c.total_volume,
        price_change_percentage_24h: c.price_change_percentage_24h ?? 0,
      })),
    );
    const markets = await getPredictionsForMarkets(marketsWithoutPredictions);
    return NextResponse.json(markets);
  } catch (error) {
    const formatted = handleAPIError(error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/predictions',
      method: 'POST',
    });
    return NextResponse.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
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
    const marketsWithoutPredictions = buildMarketsFromCoins(
      coins.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        image: c.image,
        current_price: c.current_price,
        market_cap: c.market_cap,
        total_volume: c.total_volume,
        price_change_percentage_24h: c.price_change_percentage_24h ?? 0,
      })),
    );
    const markets = await getPredictionsForMarkets(marketsWithoutPredictions);
    return NextResponse.json(markets);
  } catch (error) {
    const formatted = handleAPIError(error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/predictions',
      method: 'GET',
    });
    return NextResponse.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
    );
  }
}
