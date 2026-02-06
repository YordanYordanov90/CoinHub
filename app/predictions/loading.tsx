export default function PredictionsLoading() {
  return (
    <main className="container mx-auto min-w-0 px-4 sm:px-6 py-8">
      <header className="mb-8">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded bg-muted" />
      </header>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg border border-border/40 bg-card/50"
          />
        ))}
      </div>
    </main>
  );
}
