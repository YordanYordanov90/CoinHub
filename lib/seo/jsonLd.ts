type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue };

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return normalizeUrl(fromEnv);
  return 'http://localhost:3000';
}

export function toJsonLdScript(data: Record<string, JsonLdValue>): string {
  return JSON.stringify(data);
}

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CoinHub',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/coins?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildWebPageJsonLd(pathname: string, name: string, description: string) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${siteUrl}${pathname}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'CoinHub',
      url: siteUrl,
    },
  };
}

export function buildFinancialQuoteJsonLd(input: {
  coinId: string;
  coinName: string;
  symbol: string;
  priceUsd: number;
  marketCapUsd: number;
  imageUrl?: string;
}) {
  const siteUrl = getSiteUrl();
  const result: Record<string, JsonLdValue> = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: input.coinName,
    tickerSymbol: input.symbol.toUpperCase(),
    identifier: input.coinId,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: input.priceUsd,
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Market Cap',
        value: input.marketCapUsd,
      },
    ],
    mainEntityOfPage: `${siteUrl}/coins/${input.coinId}`,
  };

  if (input.imageUrl) {
    result.image = input.imageUrl;
  }

  return result;
}
