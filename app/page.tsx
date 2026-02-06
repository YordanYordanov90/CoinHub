import Categories from '@/components/home/categories'
import CoinOverview from '@/components/home/coin-overview'
import CryptopanicWidget from '@/components/home/cryptopanic-widget'
import {
  CategoriesFallback,
  CoinOverviewFallback,
  CryptopanicWidgetFallback,
  TrendingCoinsFallback,
} from '@/components/home/fallback'
import TrendingCoins from '@/components/home/trending-coins'
import { Suspense } from 'react'

const HomePage = async () => {
  return (
    <main className="min-h-screen container mx-auto min-w-0 overflow-x-hidden bg-linear-to-r text-white">
      <div className="container mx-auto min-w-0 max-w-full px-4 sm:px-6 py-8 gap-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] md:items-stretch">
        <section className="mb-8 md:mb-0 flex min-h-0 flex-col md:h-full">
          <Suspense fallback={<CoinOverviewFallback />}>
            <CoinOverview />
          </Suspense>
        </section>
        <section className="mb-8 md:mb-0 flex min-h-0 flex-col md:h-full">
          <Suspense fallback={<TrendingCoinsFallback />}>
            <TrendingCoins />
          </Suspense>
        </section>
      </div>
      <section className="container mx-auto min-w-0 max-w-full px-4 sm:px-6 py-8">
        <Suspense fallback={<CryptopanicWidgetFallback />}>
          <CryptopanicWidget />
        </Suspense>
      </section>
      <section className="container mx-auto min-w-0 max-w-full px-4 sm:px-6 py-8">
        <Suspense fallback={<CategoriesFallback />}>
          <Categories />
        </Suspense>
      </section>
    </main>
  )
}

export default HomePage
