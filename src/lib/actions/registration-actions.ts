'use server';

import { createHash, randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { registrationSchema } from '@/lib/validations/registration';

type RegistrationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted' | 'checked_in' | 'cancelled';

type QRCodeRow = {
  id: string;
  qr_data: string;
  qr_image_url: string | null;
  is_active: boolean;
  generated_at: string | null;
};

async function getRegistrationStatus(supabase: Awaited<ReturnType<typeof createClient>>, registrationId: string) {
  const { data: statusData } = await supabase
    .from('registrations')
    .select('status')
    .eq('id', registrationId)
    .maybeSingle();

  const data = statusData as { status: RegistrationStatus } | null;
  return (data?.status as RegistrationStatus | undefined) ?? null;
}

async function ensureRegistrationQRCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  registrationId: string
) {
  const { data: existing, error: existingError } = await supabase
    .from('qr_codes')
    .select('id, qr_data, qr_image_url, is_active, generated_at')
    .eq('registration_id', registrationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing as QRCodeRow;
  }

  const qrData = randomBytes(6).toString('hex').toUpperCase();
  const qrImageUrl = await QRCode.toDataURL(qrData, {
    width: 256,
    margin: 1,
  });
  const validationHash = createHash('sha256').update(qrData).digest('hex');

  const { data: created, error: createError } = await (supabase.from('qr_codes') as any)
    .insert({
      registration_id: registrationId,
      qr_data: qrData,
      qr_image_url: qrImageUrl,
      validation_hash: validationHash,
      is_active: true,
    })
    .select('id, qr_data, qr_image_url, is_active, generated_at')
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created as QRCodeRow;
}

export async function submitRegistration(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Please login to register' };
  }

  const raw = Object.fromEntries(formData);
  const parsed = registrationSchema.safeParse({
    eventId: raw.eventId,
    category: raw.category,
    organization: raw.organization,
    designation: raw.designation,
    dietaryPreferences: raw.dietaryPreferences || undefined,
    specialRequirements: raw.specialRequirements || undefined,
  });

  if (!parsed.success) {
    return { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from('registrations')
    .select('id')
    .eq('event_id', parsed.data.eventId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return { error: 'You are already registered for this event' };
  }

  // Check event capacity and registration status
  const { data: eventData } = await supabase
    .from('events')
    .select('max_capacity, registration_open, registration_end_date')
    .eq('id', parsed.data.eventId)
    .single();
  const event = eventData as {
    max_capacity: number | null;
    registration_open: boolean;
    registration_end_date: string | null;
  } | null;

  if (!event) {
    return { error: 'Event not found' };
  }

  if (!event.registration_open) {
    return { error: 'Registration is closed for this event' };
  }

  if (event.registration_end_date && new Date(event.registration_end_date) < new Date()) {
    return { error: 'Registration deadline has passed' };
  }

  // Check capacity
  if (event.max_capacity) {
    const { count: registrationCount } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', parsed.data.eventId)
      .in('status', ['approved', 'checked_in']);

    if (registrationCount && registrationCount >= event.max_capacity) {
      return { error: 'Event capacity reached. Please join the waitlist.' };
    }
  }

  // Generate unique reference number
  const referenceNumber = 'REG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

  const { data, error } = await (supabase
    .from('registrations') as any)
    .insert({
      event_id: parsed.data.eventId,
      user_id: user.id,
      category: parsed.data.category,
      dietary_needs: parsed.data.dietaryPreferences || null,
      special_requirements: parsed.data.specialRequirements || null,
      submission_data: {
        organization: parsed.data.organization,
        designation: parsed.data.designation,
      },
      reference_number: referenceNumber,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/registrations');
  revalidatePath(`/events/${parsed.data.eventId}`);

  return { success: true, data };
}

export async function approveRegistration(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const previousStatus = await getRegistrationStatus(supabase, registrationId);

  const { error } = await (supabase
    .from('registrations') as any)
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', registrationId);

  if (error) {
    return { error: error.message };
  }

  // Log approval
  await (supabase.from('approval_logs') as any).insert({
    entity_type: 'registration',
    entity_id: registrationId,
    action: 'approve',
    previous_status: previousStatus,
    new_status: 'approved',
    performed_by: user.id,
  });

  // Generate QR code for approved registration
  try {
    await ensureRegistrationQRCode(supabase, registrationId);
  } catch (qrError) {
    console.error('Failed to generate QR code:', qrError);
  }

  revalidatePath('/admin/events');
  revalidatePath('/dashboard/registrations');

  return { success: true };
}

export async function rejectRegistration(registrationId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const previousStatus = await getRegistrationStatus(supabase, registrationId);

  const { error } = await (supabase
    .from('registrations') as any)
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', registrationId);

  if (error) {
    return { error: error.message };
  }

  await (supabase.from('approval_logs') as any).insert({
    entity_type: 'registration',
    entity_id: registrationId,
    action: 'reject',
    previous_status: previousStatus,
    new_status: 'rejected',
    performed_by: user.id,
    notes: reason,
  });

  revalidatePath('/admin/events');

  return { success: true };
}

export async function waitlistRegistration(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const previousStatus = await getRegistrationStatus(supabase, registrationId);

  const { error } = await (supabase
    .from('registrations') as any)
    .update({
      status: 'waitlisted',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', registrationId);

  if (error) {
    return { error: error.message };
  }

  await (supabase.from('approval_logs') as any).insert({
    entity_type: 'registration',
    entity_id: registrationId,
    action: 'waitlist',
    previous_status: previousStatus,
    new_status: 'waitlisted',
    performed_by: user.id,
  });

  revalidatePath('/admin/events');

  return { success: true };
}

export async function bulkApproveRegistrations(registrationIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const results = await Promise.allSettled(
    registrationIds.map(id => approveRegistration(id))
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  const successful = registrationIds.length - failed;

  revalidatePath('/admin/events');

  return {
    success: true,
    message: `${successful} registrations approved, ${failed} failed`,
    successful,
    failed,
  };
}

export async function bulkRejectRegistrations(registrationIds: string[], reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const results = await Promise.allSettled(
    registrationIds.map(id => rejectRegistration(id, reason))
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  const successful = registrationIds.length - failed;

  revalidatePath('/admin/events');

  return {
    success: true,
    message: `${successful} registrations rejected, ${failed} failed`,
    successful,
    failed,
  };
}

export async function cancelRegistration(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await (supabase
    .from('registrations') as any)
    .update({ status: 'cancelled' })
    .eq('id', registrationId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/registrations');

  return { success: true };
}

export async function exportRegistrations(eventId: string) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('registrations')
    .select(`
      id,
      event_id,
      user_id,
      category,
      status,
      dietary_needs,
      special_requirements,
      submission_data,
      reference_number,
      reviewed_by,
      reviewed_at,
      rejection_reason,
      created_at,
      updated_at,
      profiles!inner(full_name, email, phone),
      events!inner(title)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function getRegistrationStats(eventId: string) {
  const supabase = await createClient();

  const statuses = ['pending', 'approved', 'rejected', 'waitlisted', 'checked_in'];
  const stats: Record<string, number> = {};

  for (const status of statuses) {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', status);

    if (!error) {
      stats[status] = count || 0;
    }
  }

  const { count: total, error: totalError } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (totalError) {
    return { error: totalError.message };
  }

  return {
    success: true,
    data: {
      total: total || 0,
      ...stats,
    },
  };
}

export async function getEventRegistrations(eventId: string, page = 1, pageSize = 20) {
  const supabase = createAdminClient();
  const offset = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('registrations')
    .select(
      `
      id,
      event_id,
      user_id,
      category,
      status,
      dietary_needs,
      special_requirements,
      submission_data,
      reference_number,
      reviewed_by,
      reviewed_at,
      rejection_reason,
      created_at,
      updated_at,
      events!inner(id, title)
    `,
      { count: 'exact' }
    )
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    data,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getUserRegistrations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      event_id,
      category,
      status,
      submission_data,
      reference_number,
      created_at,
      updated_at,
      events!inner(id, title, start_date, slug),
      qr_codes(id, qr_data, qr_image_url, is_active)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  const normalized = (data || []).map((registration: any) => ({
    ...registration,
    qr_codes: (registration.qr_codes || []).map((qr: any) => ({
      id: qr.id,
      code: qr.qr_data,
      qr_data_url: qr.qr_image_url,
      is_active: qr.is_active,
    })),
  }));

  return { success: true, data: normalized };
}

export async function getRegistrationQRCode(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: registrationData, error } = await supabase
    .from('registrations')
    .select('id, user_id, status')
    .eq('id', registrationId)
    .single();
  const data = registrationData as {
    id: string;
    user_id: string;
    status: string;
  } | null;

  if (error || !data) {
    return { error: 'Registration not found' };
  }

  if (data.user_id !== user.id) {
    return { error: 'Unauthorized' };
  }

  let { data: qrRecord, error: qrError } = await supabase
    .from('qr_codes')
    .select('id, qr_data, qr_image_url, is_active, generated_at')
    .eq('registration_id', registrationId)
    .maybeSingle();
  let qrData = qrRecord as {
    id: string;
    qr_data: string;
    qr_image_url: string | null;
    is_active: boolean;
    generated_at: string | null;
  } | null;

  if (qrError) {
    return { error: qrError.message };
  }

  if (!qrData && ['approved', 'checked_in'].includes(data.status)) {
    try {
      qrData = await ensureRegistrationQRCode(supabase, registrationId);
    } catch (createError) {
      return {
        error: createError instanceof Error ? createError.message : 'QR code not found',
      };
    }
  }

  if (!qrData) {
    return { error: 'QR code not found' };
  }

  const { data: latestCheckIn } = await supabase
    .from('check_in_logs')
    .select('checked_in_at')
    .eq('registration_id', registrationId)
    .order('checked_in_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const checkIn = latestCheckIn as { checked_in_at: string | null } | null;

  return {
    success: true,
    data: {
      id: qrData.id,
      code: qrData.qr_data,
      qr_data_url: qrData.qr_image_url,
      is_used: data.status === 'checked_in',
      scanned_at: checkIn?.checked_in_at ?? null,
      is_active: qrData.is_active,
      generated_at: qrData.generated_at,
    },
  };
}
