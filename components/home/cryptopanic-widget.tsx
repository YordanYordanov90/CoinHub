const CRYPTOPANIC_WIDGET_BASE = 'https://cryptopanic.com/widgets/news/';

/** Hex colors without # for the iframe query string. Matches app dark theme and orange accent. */
export const CRYPTOPANIC_WIDGET_THEME = {
  bg_color: '0f0f14',
  text_color: 'e4e4e7',
  link_color: 'f97316',
  header_bg_color: '1a1a22',
  header_text_color: 'ffffff',
} as const;

export interface CryptopanicWidgetConfig {
  /** Feed type: recent or trending */
  news_feed?: 'recent' | 'trending';
  /** Max number of posts */
  posts_limit?: number;
  /** Widget title shown inside the iframe */
  title?: string;
  /** Font family: sans, mono, etc. */
  font_family?: string;
  /** Override theme colors (hex without #) */
  theme?: Partial<Record<keyof typeof CRYPTOPANIC_WIDGET_THEME, string>>;
}

const defaultConfig: Required<CryptopanicWidgetConfig> = {
  news_feed: 'recent',
  posts_limit: 5,
  title: 'Latest News',
  font_family: 'sans',
  theme: {},
};

/**
 * Builds the CryptoPanic widget iframe src URL from config and theme.
 */
export function buildCryptopanicWidgetSrc(
  config: CryptopanicWidgetConfig = {}
): string {
  const { news_feed, posts_limit, title, font_family, theme } = {
    ...defaultConfig,
    ...config,
  };
  const colors = { ...CRYPTOPANIC_WIDGET_THEME, ...theme };
  const params = new URLSearchParams({
    news_feed,
    posts_limit: String(posts_limit),
    title,
    font_family,
    ...colors,
  });
  return `${CRYPTOPANIC_WIDGET_BASE}?${params.toString()}`;
}

export interface CryptopanicWidgetProps {
  /** Optional config (feed, limit, title, theme overrides). */
  config?: CryptopanicWidgetConfig;
  /** Height of the iframe (default 350px). */
  height?: number | string;
  /** Optional className for the wrapper. */
  className?: string;
}

/**
 * Embeds the CryptoPanic news widget in an iframe. Styled to match the app (dark theme, rounded container).
 */
export default function CryptopanicWidget({
  config,
  height = 350,
  className = '',
}: CryptopanicWidgetProps) {
  const src = buildCryptopanicWidgetSrc(config);
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`flex flex-col min-h-0 ${className}`.trim()}>
     
      <div
        className="overflow-hidden rounded-lg border border-border/40 bg-card/50 w-full"
        style={{ minHeight: heightValue }}
      >
        <iframe
          src={src}
          title="CryptoPanic latest news"
          className="w-full border-0 block"
          style={{ height: heightValue }}
         
        />
    </div>
    </div>
  );
}