import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRoles, isAdmin } from '@/lib/auth/helpers';
import AdminLayout from '@/components/layout/AdminLayout';

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const roles = await getUserRoles(user.id);
  if (!isAdmin(roles)) redirect('/dashboard');

  return <AdminLayout user={user} roles={roles}>{children}</AdminLayout>;
}
