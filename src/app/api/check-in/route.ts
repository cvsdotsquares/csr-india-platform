import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code, eventId } = await request.json();
    if (!code || !eventId) {
      return NextResponse.json(
        { error: 'Missing code or eventId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Import and use the server action logic
    const { scanQRCode } = await import('@/lib/actions/checkin-actions');
    const result = await scanQRCode(code, eventId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, attendee: result.attendee },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Check-in API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
