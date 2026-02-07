import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/api/cache';

/** GET /api/categories — coin categories (cached). */
export async function GET() {
  try {
    const data = await getCategories();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/categories]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}
