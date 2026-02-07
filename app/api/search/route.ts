import { NextRequest } from 'next/server';
import { coinGeckoClient } from '@/lib/api/client';

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
    console.error('[api/search]', error);
    return Response.json(
      { coins: [], error: error instanceof Error ? error.message : 'Search failed' },
      { status: 200 },
    );
  }
}
