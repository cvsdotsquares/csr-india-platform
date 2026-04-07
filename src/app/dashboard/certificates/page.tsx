import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

type CertificateRegistration = {
  id: string;
  event_id: string;
  status: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
  } | null;
};

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user's checked_in registrations (completed events)
  const { data } = await supabase
    .from('registrations')
    .select('id, event_id, status, created_at, events(id, title, start_date, end_date)')
    .eq('user_id', user.id)
    .eq('status', 'checked_in')
    .order('created_at', { ascending: false });
  const registrations = (data ?? []) as CertificateRegistration[];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand-500">My Certificates</h1>
      {registrations.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No certificates yet</p>
            <p className="text-sm text-muted-foreground">Certificates will be available after you complete and check in to an event.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {registrations.map(reg => (
            <Card key={reg.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-semibold text-lg">{reg.events?.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Completed on {formatDate(reg.events?.end_date || reg.created_at)}
                  </p>
                  <Badge variant="success" className="mt-2">Completed</Badge>
                </div>
                <Link href={`/api/certificate/${reg.id}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
