import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RegistrationCard from '@/components/dashboard/RegistrationCard';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

type DashboardRegistration = {
  id: string;
  status: string;
  category: string;
  submission_data?: { organization?: string; designation?: string };
  created_at: string;
  events: {
    title: string;
    start_date: string;
    venue_name: string;
  } | null;
};

export default async function RegistrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('registrations')
    .select('*, events(title, start_date, venue_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  const registrations = ((data ?? []) as Array<
    Omit<DashboardRegistration, 'submission_data'> & {
      submission_data?: { organization?: string; designation?: string } | null;
    }
  >)
    .filter((registration) => registration.events)
    .map((registration) => ({
      ...registration,
      events: registration.events!,
      submission_data: registration.submission_data || undefined,
    }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand-500">My Registrations</h1>
      {registrations.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No registrations yet</p>
            <Link href="/events" className="mt-4 inline-block rounded-lg bg-brand-500 px-6 py-2 text-white hover:bg-brand-600">Browse Events</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {registrations.map((reg) => (
            <RegistrationCard key={reg.id} registration={reg} />
          ))}
        </div>
      )}
    </div>
  );
}
