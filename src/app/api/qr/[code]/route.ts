import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();

    if (!code) {
      return Response.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Look up QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, registration_id, qr_data, qr_image_url, is_active, generated_at')
      .eq('qr_data', code)
      .maybeSingle();

    if (qrError || !qrCode) {
      return Response.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Get registration details
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        user_id,
        event_id,
        status,
        category,
        submission_data,
        reference_number,
        events!inner(title, start_date)
      `)
      .eq('id', qrCode.registration_id)
      .maybeSingle();

    if (regError || !registration) {
      return Response.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', (registration as { user_id?: string }).user_id ?? '')
      .maybeSingle();

    return Response.json({
      success: true,
      qr: qrCode,
      registration: {
        ...registration,
        profile,
      },
    });
  } catch (err) {
    console.error('QR lookup error:', err);
    return Response.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
