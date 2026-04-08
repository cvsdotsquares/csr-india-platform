import Link from 'next/link';
import { signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { publicNavigation } from '@/config/navigation';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-heading text-2xl font-bold text-brand-500">
          CSR India
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-brand-500">
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-brand-500">
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
