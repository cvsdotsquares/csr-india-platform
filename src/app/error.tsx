'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-4 text-gray-600">{error.message || 'An unexpected error occurred'}</p>
      <button onClick={reset} className="mt-8 rounded-lg bg-brand-500 px-6 py-3 text-white hover:bg-brand-600 transition-colors">
        Try Again
      </button>
    </div>
  );
}
