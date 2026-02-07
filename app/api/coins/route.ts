import { NextResponse } from 'next/server';
import { getMarkets } from '@/lib/api/cache';

/** GET /api/coins — markets list (cached). Query: vs_currency, per_page, page. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vsCurrency = searchParams.get('vs_currency') ?? 'usd';
    const perPage = Math.min(500, Math.max(1, Number(searchParams.get('per_page')) || 250));
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    const data = await getMarkets({
      vs_currency: vsCurrency,
      per_page: perPage,
      page,
      order: 'market_cap_desc',
      sparkline: false,
      price_change_percentage: '24h',
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/coins]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch coins' },
      { status: 500 },
    );
  }
}
