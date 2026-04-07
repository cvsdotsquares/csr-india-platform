import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRegistrationStats, getEventRegistrations } from '@/lib/actions/registration-actions';
import { RegistrationStats } from '@/components/admin/RegistrationStats';
import { RegistrationTable } from '@/components/admin/RegistrationTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: {
    status?: string;
    page?: string;
  };
}

type RegistrationRow = {
  id: string;
  user_id: string;
  category: string;
  status: string;
  organization: string;
  designation: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
};

function toRegistrationRow(registration: any): RegistrationRow {
  return {
    id: registration.id,
    user_id: registration.user_id,
    category: registration.category,
    status: registration.status,
    organization: registration.organization || registration.submission_data?.organization || '',
    designation: registration.designation || registration.submission_data?.designation || '',
    created_at: registration.created_at,
    profiles: {
      full_name: registration.profiles?.full_name || '',
      email: registration.profiles?.email || '',
      phone: registration.profiles?.phone || null,
    },
  };
}

export default async function EventRegistrationsPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const statusFilter = searchParams?.status || 'all';

  // Fetch event details
  const { data: eventData } = await supabase
    .from('events')
    .select('id, title, slug, registration_open')
    .eq('id', params.id)
    .single();
  const event = eventData as {
    id: string;
    title: string;
    slug: string;
    registration_open: boolean;
  } | null;

  if (!event) {
    redirect('/admin/events');
  }

  // Fetch stats
  const statsResult = await getRegistrationStats(params.id);
  const stats = statsResult.success ? statsResult.data : {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
    checked_in: 0,
  };

  // Fetch registrations
  let registrations: RegistrationRow[] = [];
  let totalCount = 0;
  let totalPages = 1;

  const hydrateRegistrations = async (registrationRows: any[]) => {
    const userIds = [...new Set((registrationRows || []).map((row) => row.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length > 0
      ? await adminClient
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', userIds)
      : { data: [] as ProfileRow[] };

    const profilesById = new Map(
      ((profiles || []) as ProfileRow[]).map((profile) => [profile.id, profile])
    );

    return (registrationRows || []).map((registration) =>
      toRegistrationRow({
        ...registration,
        profiles: profilesById.get(registration.user_id) || null,
      })
    );
  };

  if (statusFilter === 'all') {
    const result = (await getEventRegistrations(params.id, page)) as {
      success?: boolean;
      error?: string;
      data?: any[];
      count?: number;
      totalPages?: number;
    };
    if (result.success) {
      registrations = await hydrateRegistrations(result.data || []);
      totalCount = result.count || 0;
      totalPages = result.totalPages || 1;
    }
  } else {
    const { data, count, error } = await adminClient
      .from('registrations')
      .select(
        `
        id,
        user_id,
        category,
        status,
        submission_data,
        created_at
      `,
        { count: 'exact' }
      )
      .eq('event_id', params.id)
      .eq('status', statusFilter)
      .order('created_at', { ascending: false })
      .range((page - 1) * 20, page * 20 - 1);

    if (!error && data) {
      registrations = await hydrateRegistrations(data);
      totalCount = count || 0;
      totalPages = Math.ceil((count || 0) / 20);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-600 mt-2">Manage event registrations</p>
        </div>
        <Button asChild variant="outline" className="flex items-center gap-2">
          <a href={`/api/export/registrations?eventId=${params.id}`}>
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <RegistrationStats stats={stats} />
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            {statusFilter === 'all'
              ? `Total ${totalCount} registrations`
              : `${totalCount} ${statusFilter} registrations`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <a
                href={`/admin/events/${params.id}/registrations?status=all&page=1`}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  statusFilter === 'all'
                    ? 'border-[#1B3A5C] text-[#1B3A5C]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </a>
              <a
                href={`/admin/events/${params.id}/registrations?status=pending&page=1`}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  statusFilter === 'pending'
                    ? 'border-[#1B3A5C] text-[#1B3A5C]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </a>
              <a
                href={`/admin/events/${params.id}/registrations?status=approved&page=1`}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  statusFilter === 'approved'
                    ? 'border-[#1B3A5C] text-[#1B3A5C]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Approved
              </a>
              <a
                href={`/admin/events/${params.id}/registrations?status=rejected&page=1`}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  statusFilter === 'rejected'
                    ? 'border-[#1B3A5C] text-[#1B3A5C]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Rejected
              </a>
              <a
                href={`/admin/events/${params.id}/registrations?status=waitlisted&page=1`}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  statusFilter === 'waitlisted'
                    ? 'border-[#1B3A5C] text-[#1B3A5C]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Waitlisted
              </a>
            </div>
          </div>

          {/* Table */}
          <RegistrationTable registrations={registrations} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`/admin/events/${params.id}/registrations?status=${statusFilter}&page=${page - 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/events/${params.id}/registrations?status=${statusFilter}&page=${page + 1}`}
                    className="px-4 py-2 bg-[#1B3A5C] rounded-lg text-sm font-medium text-white hover:bg-[#1B3A5C]/90"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
