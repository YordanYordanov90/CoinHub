'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  getCandlestickConfig,
  getChartConfig,
  LIVE_INTERVAL_BUTTONS,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from '@/lib/utils/constants';
import {
  CandlestickSeries,
  createChart,
  IChartApi,
  ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { cn, convertOHLCData } from '@/lib/utils';
import { OHLCData } from '@/types/api';
import { LiveInterval, Period } from '@/types/models';



interface CandlestickChartProps {
  data?: OHLCData[];
  liveOhlcv?: OHLCData | null;
  coinId: string;
  height?: number;
  children?: React.ReactNode;
  mode?: 'historical' | 'live';
  initialPeriod?: Period;
  liveInterval?: LiveInterval;
  setLiveInterval?: (interval: LiveInterval) => void;
}

/** Converts OHLC data from CoinGecko format (ms timestamps) to chart format (seconds) */
function toSecondsFormat(data: OHLCData[]): OHLCData[] {
  return data.map(
    (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData,
  );
}

const CandlestickChart = ({
  children,
  data,
  coinId,
  height,
  initialPeriod = 'daily',
  liveOhlcv = null,
  mode = 'historical',
  liveInterval,
  setLiveInterval,
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const prevOhlcDataLength = useRef<number>(data?.length || 0);
  const periodCacheRef = useRef<Partial<Record<Period, OHLCData[]>>>({});

  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [responsiveHeight, setResponsiveHeight] = useState<number>(() => {
    if (typeof window === 'undefined') return 500;
    return window.matchMedia('(max-width: 640px)').matches ? 320 : 500;
  });

  // Subscribe to viewport changes when height is not controlled by prop
  useEffect(() => {
    if (height != null) return;

    const mq = window.matchMedia('(max-width: 640px)');
    const handleChange = () => setResponsiveHeight(mq.matches ? 280 : 400);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [height]);

  const chartHeight = height ?? responsiveHeight;

  // Pre-populate cache with initial data
  useEffect(() => {
    if (data?.length) {
      periodCacheRef.current[initialPeriod] = data;
    }
  }, [data, initialPeriod]);

  const fetchOHLCData = async (
    selectedPeriod: Period,
    previousPeriod: Period,
  ) => {
    setPeriodError(null);

    const cached = periodCacheRef.current[selectedPeriod];
    if (cached?.length) {
      startTransition(() => setOhlcData(cached));
      return;
    }

    const { days } = PERIOD_CONFIG[selectedPeriod];
    const url = `/api/coins/${encodeURIComponent(coinId)}/ohlc?days=${encodeURIComponent(String(days))}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OHLC fetch failed ${res.status}: ${text.slice(0, 100)}`);
      }
      const newData = (await res.json()) as OHLCData[];

      periodCacheRef.current[selectedPeriod] = newData ?? [];
      startTransition(() => {
        setOhlcData(newData ?? []);
      });
    } catch (e) {
      console.error('Failed to fetch OHLCData', e);

      const isRateLimited =
        e instanceof Error && e.message.includes('429');

      startTransition(() => {
        setPeriod(previousPeriod);
        setPeriodError(
          isRateLimited
            ? 'Rate limited. Please wait a moment and try again.'
            : 'Could not load chart data. Please try again.',
        );
      });
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;

    const previousPeriod = period;
    setPeriod(newPeriod);
    fetchOHLCData(newPeriod, previousPeriod);
  };

  // Chart creation: runs once on mount, cleanup on unmount. Does NOT recreate on period change.
  // period excluded from deps intentionally - time scale visibility is updated in a separate effect.
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ['daily', 'weekly', 'monthly'].includes(initialPeriod);

    const chart = createChart(container, {
      ...getChartConfig(chartHeight, showTime),
      width: container.clientWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [initialPeriod, chartHeight]);

  // Update time scale visibility when period changes (hourly vs daily)
  useEffect(() => {
    if (!chartRef.current) return;

    const showTime = ['daily', 'weekly', 'monthly'].includes(period);
    chartRef.current.applyOptions({
      timeScale: { timeVisible: showTime },
    });
  }, [period]);

  // Data updates: merge historical + live, set data, fit content when needed
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = toSecondsFormat(ohlcData);

    let merged: OHLCData[];

    if (liveOhlcv) {
      const liveInSeconds = toSecondsFormat([liveOhlcv])[0];
      const liveTimestampSec = liveInSeconds[0];
      const lastHistoricalCandle = convertedToSeconds[convertedToSeconds.length - 1];

      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestampSec) {
        merged = [...convertedToSeconds.slice(0, -1), liveInSeconds];
      } else {
        merged = [...convertedToSeconds, liveInSeconds];
      }
    } else {
      merged = convertedToSeconds;
    }

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged).map((d) => ({
      ...d,
      time: d.time as UTCTimestamp,
    }));
    candleSeriesRef.current.setData(converted);

    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

    if (dataChanged || mode === 'historical') {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLength.current = ohlcData.length;
    }
  }, [ohlcData, liveOhlcv, mode]);

  return (
    <div id="candlestick-chart" className="min-w-0">
      <div className="chart-header flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-0">{children}</div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Period
            </span>
            <div
              className="inline-flex rounded-lg bg-muted/50 p-0.5 border border-border/50"
              role="group"
              aria-label="Chart time period"
            >
              {PERIOD_BUTTONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePeriodChange(value)}
                  disabled={isPending}
                  aria-pressed={period === value}
                  aria-label={`${label} period`}
                  className={cn(
                    'relative px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-medium rounded-md transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'disabled:opacity-50 disabled:cursor-not-allowed ',
                    period === value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {liveInterval != null && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Update
              </span>
              <div
                className="inline-flex rounded-lg bg-muted/50 p-0.5 border border-border/50"
                role="group"
                aria-label="Live update frequency"
              >
                {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLiveInterval?.(value)}
                    disabled={isPending}
                    aria-pressed={liveInterval === value}
                    aria-label={`${label} update interval`}
                    className={cn(
                    'px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-medium rounded-md transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      liveInterval === value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {periodError && (
        <p
          role="alert"
          className="mt-2 text-xs text-amber-600 dark:text-amber-500"
        >
          {periodError}
        </p>
      )}

      <div ref={chartContainerRef} className="chart min-w-0 overflow-hidden" style={{ height: chartHeight }} />
    </div>
  );
};

export default CandlestickChart;
