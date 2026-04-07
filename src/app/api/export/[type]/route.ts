import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (params.type === 'registrations') {
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(
          `
          id,
          status,
          category,
          created_at,
          profiles!inner(full_name, email, phone, organization)
        `
        )
        .eq('event_id', eventId)
        .order('created_at');

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      if (!registrations || registrations.length === 0) {
        return NextResponse.json(
          { error: 'No registrations found for this event' },
          { status: 404 }
        );
      }

      // Build CSV
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Organization',
        'Category',
        'Status',
        'Registered At',
      ];

      const rows = registrations.map((reg: any) => {
        const profile = reg.profiles;
        return [
          `"${profile?.full_name || ''}"`,
          `"${profile?.email || ''}"`,
          `"${profile?.phone || ''}"`,
          `"${profile?.organization || ''}"`,
          `"${reg.category || ''}"`,
          `"${reg.status || ''}"`,
          `"${new Date(reg.created_at).toLocaleString('en-IN')}"`,
        ];
      });

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="registrations-${eventId}-${Date.now()}.csv"`,
        },
      });
    }

    if (params.type === 'users') {
      const { data: users, error } = await supabase
        .from('profiles')
        .select(
          `
          id,
          email,
          full_name,
          phone,
          organization,
          created_at,
          user_roles!inner(roles(name))
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      if (!users || users.length === 0) {
        return NextResponse.json(
          { error: 'No users found' },
          { status: 404 }
        );
      }

      // Build CSV
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Organization',
        'Roles',
        'Joined',
      ];

      const rows = users.map((user: any) => {
        const roles = user.user_roles
          ?.map((ur: any) => ur.roles?.name)
          .join('; ') || 'None';

        return [
          `"${user.full_name || ''}"`,
          `"${user.email || ''}"`,
          `"${user.phone || ''}"`,
          `"${user.organization || ''}"`,
          `"${roles}"`,
          `"${new Date(user.created_at).toLocaleString('en-IN')}"`,
        ];
      });

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="users-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid export type. Supported types: registrations, users' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
