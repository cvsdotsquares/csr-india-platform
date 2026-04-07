'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { adminNavigation } from '@/config/navigation';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Menu, X, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User;
  roles: string[];
}

export default function AdminLayout({ children, user, roles }: AdminLayoutProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-brand-500 text-white transition-transform lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="font-heading text-xl font-bold">CSR Admin</Link>
          <button onClick={toggleSidebar} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-4 space-y-1 px-2">
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-brand-600 text-white' : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                )}>
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <button onClick={toggleSidebar} className="lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
