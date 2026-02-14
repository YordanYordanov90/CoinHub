import type { Metadata } from 'next';
import PredictionPanel from '@/components/features/predictions/PredictionPanel';
import { buildWebPageJsonLd, toJsonLdScript } from '@/lib/seo/jsonLd';

export const metadata: Metadata = {
  title: 'Predictions',
  description:
    'AI-generated short-term crypto market outlooks based on current market data. Not financial advice.',
  openGraph: {
    title: 'AI Prediction Markets | CoinHub',
    description:
      'Explore AI-generated cryptocurrency prediction markets and compare target prices.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Prediction Markets | CoinHub',
    description:
      'Explore AI-generated cryptocurrency prediction markets and compare target prices.',
  },
};

export default function PredictionsPage() {
  const webPageJsonLd = buildWebPageJsonLd(
    '/predictions',
    'AI Prediction Markets',
    'AI-generated short-term cryptocurrency market outlooks.',
  );

  return (
    <main className="container mx-auto min-w-0 px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(webPageJsonLd) }}
      />
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          AI Prediction Markets
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Short AI-generated outlooks based on current market data. Not financial advice.
        </p>
      </header>
      <PredictionPanel />
    </main>
  );
}
