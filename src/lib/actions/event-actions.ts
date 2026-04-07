'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { eventSchema, sessionSchema } from '@/lib/validations/event';
import type { Database } from '@/types/database';

type Event = Database['public']['Tables']['events']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];

export async function createEvent(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = eventSchema.safeParse({
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      shortDescription: raw.shortDescription || undefined,
      startDate: raw.startDate,
      endDate: raw.endDate,
      venue: raw.venue,
      venueAddress: raw.venueAddress || undefined,
      city: raw.city,
      maxCapacity: raw.maxCapacity ? Number(raw.maxCapacity) : undefined,
      registrationDeadline: raw.registrationDeadline || undefined,
      isRegistrationOpen: raw.isRegistrationOpen === 'true',
      isFeatured: raw.isFeatured === 'true',
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { data, error } = await (supabase
      .from('events') as any)
      .insert({
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        short_description: parsed.data.shortDescription,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate,
        venue_name: parsed.data.venue,
        venue_address: parsed.data.venueAddress,
        city: parsed.data.city,
        max_capacity: parsed.data.maxCapacity,
        registration_end_date: parsed.data.registrationDeadline,
        registration_open: parsed.data.isRegistrationOpen,
        is_featured: parsed.data.isFeatured,
        created_by: user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/events');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = eventSchema.safeParse({
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      shortDescription: raw.shortDescription || undefined,
      startDate: raw.startDate,
      endDate: raw.endDate,
      venue: raw.venue,
      venueAddress: raw.venueAddress || undefined,
      city: raw.city,
      maxCapacity: raw.maxCapacity ? Number(raw.maxCapacity) : undefined,
      registrationDeadline: raw.registrationDeadline || undefined,
      isRegistrationOpen: raw.isRegistrationOpen === 'true',
      isFeatured: raw.isFeatured === 'true',
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { error } = await (supabase
      .from('events') as any)
      .update({
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        short_description: parsed.data.shortDescription,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate,
        venue_name: parsed.data.venue,
        venue_address: parsed.data.venueAddress,
        city: parsed.data.city,
        max_capacity: parsed.data.maxCapacity,
        registration_end_date: parsed.data.registrationDeadline,
        registration_open: parsed.data.isRegistrationOpen,
        is_featured: parsed.data.isFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/events');
    revalidatePath(`/events/${parsed.data.slug}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function publishEvent(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await (supabase
      .from('events') as any)
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function archiveEvent(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await (supabase
      .from('events') as any)
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function cancelEvent(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await (supabase
      .from('events') as any)
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase.from('events').delete().eq('id', eventId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/events');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function createSession(eventId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = sessionSchema.safeParse({
      eventId,
      title: raw.title,
      description: raw.description || undefined,
      sessionType: raw.sessionType,
      startTime: raw.startTime,
      endTime: raw.endTime,
      venue: raw.venue || undefined,
      maxCapacity: raw.maxCapacity ? Number(raw.maxCapacity) : undefined,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { data, error } = await (supabase
      .from('sessions') as any)
      .insert({
        event_id: parsed.data.eventId,
        title: parsed.data.title,
        description: parsed.data.description,
        session_type: parsed.data.sessionType,
        session_date: parsed.data.startTime.split('T')[0],
        start_time: parsed.data.startTime.split('T')[1],
        end_time: parsed.data.endTime.split('T')[1],
        room: parsed.data.venue,
        max_seats: parsed.data.maxCapacity,
        display_order: parsed.data.sortOrder,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function updateSession(sessionId: string, eventId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = sessionSchema.safeParse({
      eventId,
      title: raw.title,
      description: raw.description || undefined,
      sessionType: raw.sessionType,
      startTime: raw.startTime,
      endTime: raw.endTime,
      venue: raw.venue || undefined,
      maxCapacity: raw.maxCapacity ? Number(raw.maxCapacity) : undefined,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { error } = await (supabase
      .from('sessions') as any)
      .update({
        title: parsed.data.title,
        description: parsed.data.description,
        session_type: parsed.data.sessionType,
        session_date: parsed.data.startTime.split('T')[0],
        start_time: parsed.data.startTime.split('T')[1],
        end_time: parsed.data.endTime.split('T')[1],
        room: parsed.data.venue,
        max_seats: parsed.data.maxCapacity,
        display_order: parsed.data.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function deleteSession(sessionId: string, eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function getEventById(eventId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function getEventBySlug(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function getEventSessions(eventId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function getAllPublishedEvents() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function getAllAdminEvents() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}
