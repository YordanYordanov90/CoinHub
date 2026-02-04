import { cn } from '@/lib/utils';
import { formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

const PRICE_UP_CLASS = 'text-green-500';
const PRICE_DOWN_CLASS = 'text-red-500';

interface PriceChangeDisplayProps {
  value: number | null | undefined;
  showIcon?: boolean;
  className?: string;
  /** Optional size variant for text (default: base) */
  size?: 'sm' | 'base' | 'lg';
}

export function PriceChangeDisplay({
  value,
  showIcon = false,
  className,
  size = 'base',
}: PriceChangeDisplayProps) {
  if (value === null || value === undefined) {
    return <span className={className}>—</span>;
  }

  const isUp = value >= 0;
  const sizeClass =
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl font-medium' : '';

  return (
    <span
      className={cn(
        'change-value',
        isUp ? PRICE_UP_CLASS : PRICE_DOWN_CLASS,
        sizeClass,
        showIcon && 'inline-flex items-center gap-1',
        className,
      )}
    >
      {isUp && '+'}
      {formatPercentage(value)}
      {showIcon &&
        (isUp ? (
          <TrendingUp className="size-4 shrink-0" aria-hidden />
        ) : (
          <TrendingDown className="size-4 shrink-0" aria-hidden />
        ))}
    </span>
  );
}
