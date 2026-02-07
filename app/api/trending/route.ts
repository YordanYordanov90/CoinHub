import { NextResponse } from 'next/server';
import { getTrendingCoins } from '@/lib/api/cache';

/** GET /api/trending — trending coins (cached). */
export async function GET() {
  try {
    const data = await getTrendingCoins();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/trending]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch trending' },
      { status: 500 },
    );
  }
}
