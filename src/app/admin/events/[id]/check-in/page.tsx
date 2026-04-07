import { createClient } from '@/lib/supabase/server';
import { getCheckInStats, getRecentCheckIns } from '@/lib/actions/checkin-actions';
import CheckInDashboard from '@/components/check-in/CheckInDashboard';

export default async function CheckInPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('id, title').eq('id', params.id).single();

  if (!event) return <div>Event not found</div>;

  const stats = await getCheckInStats(params.id);
  const recentCheckIns = await getRecentCheckIns(params.id);

  return <CheckInDashboard event={event} initialStats={stats} initialRecentCheckIns={recentCheckIns} />;
}
