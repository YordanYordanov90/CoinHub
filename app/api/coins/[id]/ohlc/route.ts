import { NextRequest } from 'next/server';
import { coinGeckoClient } from '@/lib/api/client';

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
    return Response.json({ error: 'Invalid coin id' }, { status: 400 });
  }

  const { searchParams } = new URL(_request.url);
  const daysParam = searchParams.get('days') ?? '1';
  const daysNum = VALID_DAYS.has(daysParam) ? Number(daysParam) : 1;

  try {
    const data = await coinGeckoClient.getOHLC(id, daysNum);
    return Response.json(data);
  } catch (error) {
    console.error('[api/coins/[id]/ohlc]', id, error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch OHLC' },
      { status: 500 },
    );
  }
}
