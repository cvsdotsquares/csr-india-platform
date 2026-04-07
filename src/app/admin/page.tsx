import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalEvents },
    { count: totalRegistrations },
    { count: pendingRegistrations },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: 'Total Events', value: totalEvents || 0 },
    { label: 'Total Registrations', value: totalRegistrations || 0 },
    { label: 'Pending Review', value: pendingRegistrations || 0 },
    { label: 'Registered Users', value: totalUsers || 0 },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand-500">Admin Dashboard</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-brand-500">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
