import type { MetadataRoute } from 'next';
import { getMarkets } from '@/lib/api/cache';
import { getSiteUrl } from '@/lib/seo/jsonLd';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/coins`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/predictions`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  try {
    const coins = await getMarkets({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    });

    const coinRoutes: MetadataRoute.Sitemap = coins.map((coin) => ({
      url: `${siteUrl}/coins/${coin.id}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...coinRoutes];
  } catch {
    return staticRoutes;
  }
}
