import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header';
import QueryProvider from '@/lib/providers/QueryProvider';
import { getSiteUrl } from '@/lib/seo/jsonLd';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'CoinHub',
    template: '%s | CoinHub',
  },
  description: 'Track cryptocurrency prices, charts, categories, and AI-based market predictions in one place.',
  keywords: [
    'crypto',
    'cryptocurrency',
    'bitcoin',
    'ethereum',
    'coin prices',
    'market cap',
    'crypto predictions',
    'CoinGecko',
  ],
  openGraph: {
    type: 'website',
    siteName: 'CoinHub',
    title: 'CoinHub',
    description: 'Track cryptocurrency prices, charts, categories, and AI-based market predictions.',
    images: ['/next.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoinHub',
    description: 'Track cryptocurrency prices, charts, and market predictions.',
    images: ['/next.svg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark overflow-x-hidden`}
      >
        <QueryProvider>
          <Header />
          <div className="pt-14">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
