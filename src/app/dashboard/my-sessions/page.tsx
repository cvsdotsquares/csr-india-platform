import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type RegistrationEvent = {
  event_id: string;
  events: {
    id: string;
    title: string;
    start_date: string;
  } | null;
};

type DashboardSession = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  room: string | null;
  session_type: string;
  events: {
    title: string;
  } | null;
};

export default async function MySessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user's approved/checked_in registrations
  const { data: registrationsData } = await supabase
    .from('registrations')
    .select('event_id, events(id, title, start_date)')
    .eq('user_id', user.id)
    .in('status', ['approved', 'checked_in']);
  const registrations = (registrationsData ?? []) as RegistrationEvent[];

  const eventIds = registrations?.map(r => r.event_id) || [];

  let sessions: DashboardSession[] = [];
  if (eventIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('*, events(title)')
      .in('event_id', eventIds)
      .order('start_time', { ascending: true });
    sessions = (data ?? []) as DashboardSession[];
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand-500">My Sessions</h1>
      {sessions.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No upcoming sessions</p>
            <p className="text-sm text-muted-foreground">Sessions will appear here once you&apos;re registered for an event.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {sessions.map(session => (
            <Card key={session.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">{session.events?.title}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(session.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {new Date(session.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    {session.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.room}</span>}
                  </div>
                </div>
                <Badge variant="secondary">{session.session_type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
