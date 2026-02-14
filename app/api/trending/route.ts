import { NextResponse } from 'next/server';
import { getTrendingCoins } from '@/lib/api/cache';
import { handleAPIError, logError } from '@/lib/errors/handler';

/** GET /api/trending — trending coins (cached). */
export async function GET() {
  try {
    const data = await getTrendingCoins();
    return NextResponse.json(data);
  } catch (error) {
    const formatted = handleAPIError(error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/trending',
    });
    return NextResponse.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
    );
  }
}
