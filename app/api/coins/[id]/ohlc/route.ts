import { NextRequest } from 'next/server';
import { fetcher } from '@/lib/coingecko.actions';

const OHLC_REVALIDATE = 300;

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
    return new Response(null, { status: 404 });
  }

  const { searchParams } = new URL(_request.url);
  const daysParam = searchParams.get('days') ?? '1';
  const days = VALID_DAYS.has(daysParam) ? daysParam : '1';

  const data = await fetcher<OHLCData[]>(
    `/coins/${id}/ohlc`,
    { vs_currency: 'usd', days },
    OHLC_REVALIDATE,
  );

  return Response.json(data);
}
