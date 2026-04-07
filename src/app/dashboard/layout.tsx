import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRoles, isAdmin } from '@/lib/auth/helpers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export const dynamic = 'force-dynamic';

type DashboardProfile = {
  full_name: string | null;
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
  const profile = data as DashboardProfile | null;
  const roles = await getUserRoles(user.id);

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar userName={profile?.full_name || ''} userEmail={user.email!} isAdmin={isAdmin(roles)} />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <Footer />
    </>
  );
}
