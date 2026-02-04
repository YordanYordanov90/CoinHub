export default function Loading() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-center min-h-[200px]">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
        <span className="sr-only">Loading…</span>
      </div>
    </main>
  );
}
