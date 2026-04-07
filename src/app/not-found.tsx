import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-brand-500">404</h1>
      <p className="mt-4 text-xl text-gray-600">Page not found</p>
      <Link href="/" className="mt-8 rounded-lg bg-brand-500 px-6 py-3 text-white hover:bg-brand-600 transition-colors">
        Go Home
      </Link>
    </div>
  );
}
