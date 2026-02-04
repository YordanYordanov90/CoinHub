import { NextRequest } from 'next/server';
import { fetchSearch } from '@/lib/coingecko.server';

/** GET /api/search?q=... — returns { coins: SearchResultCoin[], error?: string }. Used by SearchModal with SWR. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (q.length < 2 || q.length > 100) {
    return Response.json({ coins: [] });
  }
  try {
    const result = await fetchSearch(q);
    return Response.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json(
      { coins: [], error: error instanceof Error ? error.message : 'Search failed' },
      { status: 200 },
    );
  }
}
