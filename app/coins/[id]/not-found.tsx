import Link from 'next/link';

export default function CoinNotFound() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-xl font-semibold">Coin not available</h1>
        <p className="text-muted-foreground text-sm">
          This coin&apos;s details are only available on a paid API plan. The free tier supports a limited set of coins.
        </p>
        <Link
          href="/coins"
          className="inline-block text-sm text-primary hover:underline"
        >
          ← Back to all coins
        </Link>
      </div>
    </main>
  );
}
