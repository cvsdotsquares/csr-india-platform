'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type CheckInProfile = {
  full_name: string | null;
  email: string | null;
  phone?: string | null;
  organization?: string | null;
};

type CheckInRegistration = {
  id: string;
  event_id: string;
  status: string;
  category: string;
  user_id: string;
};

type QRScanResult = {
  id: string;
  registration_id: string;
  is_active: boolean;
};

export async function scanQRCode(code: string, eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Find QR code
  const { data: qrData, error: qrError } = await supabase
    .from('qr_codes')
    .select('id, registration_id, is_active')
    .eq('qr_data', code.trim().toUpperCase())
    .maybeSingle();
  const qr = qrData as QRScanResult | null;

  if (qrError || !qr || !qr.is_active) return { error: 'Invalid QR code' };

  const { data: regData, error: regError } = await supabase
    .from('registrations')
    .select('id, event_id, status, category, user_id')
    .eq('id', qr.registration_id)
    .maybeSingle();
  const reg = regData as CheckInRegistration | null;

  if (regError || !reg) return { error: 'Registration not found' };

  const { data: attendeeData } = await supabase
    .from('profiles')
    .select('full_name, email, phone, organization')
    .eq('id', reg.user_id)
    .maybeSingle();
  const attendee = (attendeeData as CheckInProfile | null) ?? null;

  if (reg.status === 'checked_in') return { error: 'Already checked in', attendee };
  if (reg.event_id !== eventId) return { error: 'QR code is for a different event' };
  if (reg.status !== 'approved') return { error: `Registration status is "${reg.status}", must be approved` };

  // Update registration status
  await (supabase.from('registrations') as any)
    .update({ status: 'checked_in' })
    .eq('id', reg.id);

  // Log check-in
  await (supabase.from('check_in_logs') as any).insert({
    registration_id: reg.id,
    qr_code_id: qr.id,
    checked_in_by: user.id,
    checkin_method: 'qr_scan',
  });

  revalidatePath(`/admin/events/${eventId}/check-in`);
  return { success: true, attendee, category: reg.category };
}

export async function manualCheckIn(registrationId: string, eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: regData } = await supabase
    .from('registrations')
    .select('id, event_id, status, category, user_id')
    .eq('id', registrationId)
    .single();
  const reg = regData as CheckInRegistration | null;

  if (!reg) return { error: 'Registration not found' };
  if (reg.status === 'checked_in') return { error: 'Already checked in' };
  if (reg.status !== 'approved') return { error: `Status is "${reg.status}", must be approved` };

  await (supabase.from('registrations') as any)
    .update({ status: 'checked_in' })
    .eq('id', registrationId);

  await (supabase.from('check_in_logs') as any).insert({
    registration_id: registrationId,
    checked_in_by: user.id,
    checkin_method: 'manual_search',
  });

  const { data: attendeeData } = await supabase
    .from('profiles')
    .select('full_name, email, phone, organization')
    .eq('id', reg.user_id)
    .maybeSingle();
  const attendee = (attendeeData as CheckInProfile | null) ?? null;

  revalidatePath(`/admin/events/${eventId}/check-in`);
  return { success: true, attendee };
}

export async function undoCheckIn(registrationId: string, eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await (supabase.from('registrations') as any)
    .update({ status: 'approved' })
    .eq('id', registrationId);

  revalidatePath(`/admin/events/${eventId}/check-in`);
  return { success: true };
}

export async function getCheckInStats(eventId: string) {
  const supabase = await createClient();

  const { data: regsData } = await supabase
    .from('registrations')
    .select('status')
    .eq('event_id', eventId)
    .in('status', ['approved', 'checked_in']);
  const regs = (regsData || []) as Array<{ status: string }>;

  const approved = regs?.filter(r => r.status === 'approved').length || 0;
  const checkedIn = regs?.filter(r => r.status === 'checked_in').length || 0;
  const total = approved + checkedIn;
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return { total, checkedIn, remaining: approved, percentage };
}

export async function searchForCheckIn(eventId: string, query: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('registrations')
    .select('id, status, category, organization, designation, profiles(full_name, email, phone)')
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .or(`profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%`)
    .limit(10);

  return (data || []) as Array<{
    id: string;
    status: string;
    category: string;
    organization: string | null;
    designation: string | null;
    profiles: CheckInProfile | null;
  }>;
}

export async function getRecentCheckIns(eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('check_in_logs')
    .select('*, registrations!inner(event_id, category, profiles(full_name, email))')
    .eq('registrations.event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(20);

  return (data || []) as Array<{
    id: string;
    registration_id: string;
    event_id: string | null;
    checked_in_by: string | null;
    method: string;
    notes: string | null;
    created_at: string;
    registrations: {
      event_id: string;
      category: string;
      profiles: Pick<CheckInProfile, 'full_name' | 'email'> | null;
    };
  }>;
}
