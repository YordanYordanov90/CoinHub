import { NextResponse } from 'next/server';
import { getCoinDetails } from '@/lib/api/cache';
import { APIError } from '@/lib/errors';
import { handleAPIError, logError } from '@/lib/errors/handler';

function isValidCoinId(id: string): boolean {
  return /^[a-z0-9_-]{1,50}$/i.test(id);
}

/** GET /api/coins/[id] — single coin details (cached). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidCoinId(id)) {
    const formatted = handleAPIError(new APIError('Invalid coin id', 400, true, 'BAD_REQUEST'));
    return NextResponse.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
    );
  }
  try {
    const data = await getCoinDetails(id);
    if (data == null) {
      const formatted = handleAPIError(new APIError('Coin not found', 404, true, 'NOT_FOUND'));
      return NextResponse.json(
        { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
        { status: formatted.statusCode },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    const formatted = handleAPIError(error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/coins/[id]',
      coinId: id,
    });
    return NextResponse.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
    );
  }
}
