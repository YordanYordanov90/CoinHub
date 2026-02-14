import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/api/cache';
import { handleAPIError, logError } from '@/lib/errors/handler';

/** GET /api/categories — coin categories (cached). */
export async function GET() {
  try {
    const data = await getCategories();
    return NextResponse.json(data);
  } catch (error) {
    const formatted = handleAPIError(error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/categories',
    });
    return NextResponse.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
    );
  }
}
