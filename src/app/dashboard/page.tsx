import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type RegistrationSummary = {
  id: string;
  status: Database['public']['Enums']['registration_status'];
  events: {
    title: string;
    start_date: string;
    venue_name: string | null;
  } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const registrationsResult = await supabase
    .from('registrations')
    .select('*, events(title, start_date, venue_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  const registrations = (registrationsResult.data ?? []) as RegistrationSummary[];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand-500">My Dashboard</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Total Registrations</p>
          <p className="text-3xl font-bold">{registrations.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-3xl font-bold text-green-600">
            {registrations.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-amber-600">
            {registrations.filter(r => r.status === 'pending').length}
          </p>
        </div>
      </div>
    </div>
  );
}
