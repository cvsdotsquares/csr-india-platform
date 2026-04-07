import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const publicRoutes = ['/', '/about', '/events', '/blog', '/gallery', '/partners', '/speakers', '/contact', '/faq'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export async function middleware(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Public routes — always accessible
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response;
  }

  // Auth routes — redirect to dashboard if already logged in
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Protected routes — redirect to login if not authenticated
  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes — check for admin roles
  if (pathname.startsWith('/admin')) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id);

    const roleNames = roles?.map((r: any) => r.roles?.name) || [];
    const adminRoles = ['super_admin', 'event_admin', 'content_admin', 'reviewer', 'checkin_staff'];

    if (!roleNames.some((r: string) => adminRoles.includes(r))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
