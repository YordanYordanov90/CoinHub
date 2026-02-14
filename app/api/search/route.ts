import { NextRequest } from 'next/server';
import { coinGeckoClient } from '@/lib/api/client';
import { handleAPIError, logError } from '@/lib/errors/handler';

/** GET /api/search?q=... — returns { coins: SearchResultCoin[], error?: string }. Used by SearchModal with SWR. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (q.length < 2 || q.length > 100) {
    return Response.json({ coins: [] });
  }
  try {
    const result = await coinGeckoClient.searchCoins(q);
    return Response.json(result);
  } catch (error) {
    const formatted = handleAPIError(error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/search',
      queryLength: q.length,
    });
    return Response.json(
      {
        coins: [],
        error: formatted.message,
        code: formatted.code,
        timestamp: formatted.timestamp,
      },
      { status: 200 },
    );
  }
}
