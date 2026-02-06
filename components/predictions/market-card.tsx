import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { PriceChangeDisplay } from '@/components/ui/price-change';
import type { PredictionMarket } from '@/lib/predictions/types';

interface PredictionMarketCardProps {
  market: PredictionMarket;
}

export default function PredictionMarketCard({ market }: PredictionMarketCardProps) {
  const formattedEndDate = new Date(market.endDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="rounded-lg border border-border/40 bg-card/50 p-5 transition-shadow hover:shadow-md ">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/coins/${market.coinId}`}
            className="shrink-0 rounded-full ring-2 ring-border/60 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View ${market.name} details`}
          >
            <Image
              src={market.image}
              alt=""
              width={48}
              height={48}
              className="rounded-full"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-foreground">
              <Link href={`/coins/${market.coinId}`} className="hover:underline">
                {market.name}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              {market.symbol.toUpperCase()} · {formatCurrency(market.currentPrice)}
              {' · '}
              <PriceChangeDisplay value={market.priceChangePercentage24h} size="sm" />
            </p>
          </div>
        </div>

        <p className="text-sm font-medium text-foreground">
          Will {market.name} reach {formatCurrency(market.targetPrice)} by {formattedEndDate}?
        </p>

        {market.aiPrediction ? (
          <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
            <p className="text-sm italic text-muted-foreground">{market.aiPrediction}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Prediction unavailable.</p>
        )}
      </div>
    </article>
  );
}
