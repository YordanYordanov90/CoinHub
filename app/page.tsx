import CoinOverview from '@/components/home/coin-overview'
import {
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from '@/components/home/fallback'
import TrendingCoins from '@/components/home/trending-coins'
import { Suspense } from 'react'

const HomePage = async () => {
  return (
    <main className="min-h-screen bg-linear-to-r from-zinc-900 to-zinc-800 text-white">
      <div className="container mx-auto px-4 py-8 gap-8 grid grid-cols-1 md:grid-cols-2">
        <section className="mb-12">
          <Suspense fallback={<CoinOverviewFallback />}>
            <CoinOverview />
          </Suspense>
        </section>
        <section className="mb-12">
          <Suspense fallback={<TrendingCoinsFallback />}>
            <TrendingCoins />
          </Suspense>
        </section>
      </div>
    </main>
  )
}

export default HomePage
