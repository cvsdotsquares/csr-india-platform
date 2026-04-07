'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dashboardNavigation } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface DashboardSidebarProps {
  userName: string;
  userEmail: string;
  isAdmin?: boolean;
}

export default function DashboardSidebar({ userName, userEmail, isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-white p-6 hidden lg:block">
      <div className="flex items-center gap-3 mb-8">
        <Avatar>
          <AvatarFallback className="bg-brand-500 text-white">{getInitials(userName || userEmail)}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="font-medium truncate">{userName || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
      </div>
      <nav className="space-y-1">
        {dashboardNavigation.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors', isActive ? 'bg-brand-50 text-brand-500 font-medium' : 'text-gray-700 hover:bg-gray-100')}>
              <Icon className="h-4 w-4" />{item.name}
            </Link>
          );
        })}
        {isAdmin && (
          <>
            <div className="my-4 border-t" />
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Admin Panel
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
