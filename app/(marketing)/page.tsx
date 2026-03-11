import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, TrendingUp, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildWebPageJsonLd, buildWebSiteJsonLd, toJsonLdScript } from '@/lib/seo/jsonLd';

export const metadata: Metadata = {
  title: 'CoinHub | The Future of Crypto Navigation',
  description: 'Navigate the Crypto Markets with AI Precision. Get live data, price predictions, and real-time news in one place.',
};

export default function LandingPage() {
  const webSiteJsonLd = buildWebSiteJsonLd();
  const webPageJsonLd = buildWebPageJsonLd(
    '/',
    'CoinHub | The Future of Crypto Navigation',
    'Navigate the Crypto Markets with AI Precision. Get live data, price predictions, and real-time news in one place.',
  );

  return (
    <main className="min-h-screen flex flex-col justify-center items-center py-20 px-4 sm:px-6 relative overflow-hidden text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(webPageJsonLd) }}
      />

      {/* Hero Section */}
      <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center rounded-full border border-border/40 bg-background/40 px-3 py-1 text-sm mb-8 backdrop-blur-md">
          <span className="flex size-2 rounded-full bg-[#ff8c00] animate-pulse mr-2"></span>
          CoinHub 2.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent leading-tight">
          Navigate the Crypto Markets with <span className="text-[#ff8c00]">AI Precision</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Your all-in-one terminal for live market data, accurate AI-driven price predictions, and real-time breaking news across the entire blockchain ecosystem.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/markets"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff8c00] text-white px-8 py-4 font-medium transition-all hover:bg-[#ff8c00]/90 hover:scale-105 active:scale-95 shadow-lg shadow-[#ff8c00]/20"
          >
            Explore Markets
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/coins"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-background/50 backdrop-blur-md border border-border/50 text-foreground px-8 py-4 font-medium transition-all hover:bg-background/80 hover:scale-105 active:scale-95"
          >
            Terminal
          </Link>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div className="z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto">
        <FeatureCard 
          icon={BarChart3}
          title="Live Market Data"
          description="Real-time synchronized data from CoinGecko Pro. Track over 10,000+ cryptocurrencies globally."
        />
        <FeatureCard 
          icon={TrendingUp}
          title="AI Predictions"
          description="Proprietary machine learning models forecasting short and mid-term price fluctuations."
          featured={true}
        />
        <FeatureCard 
          icon={Newspaper}
          title="Real-time News"
          description="Aggregated breaking news from Cryptopanic to keep your finger on the pulse of the market."
        />
      </div>
      
      {/* Abstract Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff8c00]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </main>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  featured = false 
}: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  featured?: boolean
}) {
  return (
    <div className={cn(
      "flex flex-col gap-4 p-8 rounded-2xl border transition-all hover:-translate-y-2 hover:shadow-xl",
      featured 
        ? "bg-[#ff8c00]/5 border-[#ff8c00]/20 shadow-[#ff8c00]/5" 
        : "bg-card/30 backdrop-blur-xl border-border/40 shadow-black/10"
    )}>
      <div className={cn(
        "inline-flex p-3 rounded-xl w-fit",
        featured ? "bg-[#ff8c00]/20 text-[#ff8c00]" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="size-6" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
