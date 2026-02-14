import { NextRequest } from 'next/server';
import { coinGeckoClient } from '@/lib/api/client';
import { APIError } from '@/lib/errors';
import { handleAPIError, logError } from '@/lib/errors/handler';

const VALID_DAYS = new Set(['1', '7', '30', '90']);

function isValidCoinId(id: string): boolean {
  return /^[a-z0-9_-]{1,50}$/i.test(id);
}

/** GET /api/coins/[id]/ohlc?days=1|7|30|90 — used by client CandlestickChart to avoid importing server-only module. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidCoinId(id)) {
    const formatted = handleAPIError(new APIError('Invalid coin id', 400, true, 'BAD_REQUEST'));
    return Response.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
    );
  }

  const { searchParams } = new URL(_request.url);
  const daysParam = searchParams.get('days') ?? '1';
  const daysNum = VALID_DAYS.has(daysParam) ? Number(daysParam) : 1;

  try {
    const data = await coinGeckoClient.getOHLC(id, daysNum);
    return Response.json(data);
  } catch (error) {
    const formatted = handleAPIError(error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/coins/[id]/ohlc',
      coinId: id,
      days: daysNum,
    });
    return Response.json(
      { error: formatted.message, code: formatted.code, timestamp: formatted.timestamp },
      { status: formatted.statusCode },
    );
  }
}
