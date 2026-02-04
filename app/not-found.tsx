import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-primary hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
