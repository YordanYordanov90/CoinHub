import { NextResponse } from 'next/server';
import { getCoinDetails } from '@/lib/api/cache';

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
    return NextResponse.json({ error: 'Invalid coin id' }, { status: 400 });
  }
  try {
    const data = await getCoinDetails(id);
    if (data == null) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/coins/[id]]', id, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch coin' },
      { status: 500 },
    );
  }
}
