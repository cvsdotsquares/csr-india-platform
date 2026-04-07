'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function addUserRole(userId: string, roleId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Check if user already has this role
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();

    if (existing) {
      return { error: 'User already has this role' };
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
      } as any);

    if (error) {
      return { error: error.message };
    }

    // Audit log
    const { data: roleData } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();
    const role = roleData as { name: string } | null;

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'role_assign',
      entity_type: 'user',
      entity_id: userId,
      new_data: { role_id: roleId, role_name: role?.name },
      ip_address: null,
      user_agent: null,
    } as any);

    revalidatePath('/admin/users');

    return { success: true };
  } catch (err) {
    console.error('Error adding user role:', err);
    return { error: 'Failed to add user role' };
  }
}

export async function removeUserRole(userId: string, roleId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      return { error: error.message };
    }

    // Audit log
    const { data: roleData } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();
    const role = roleData as { name: string } | null;

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'role_revoke',
      entity_type: 'user',
      entity_id: userId,
      new_data: { role_id: roleId, role_name: role?.name },
      ip_address: null,
      user_agent: null,
    } as any);

    revalidatePath('/admin/users');

    return { success: true };
  } catch (err) {
    console.error('Error removing user role:', err);
    return { error: 'Failed to remove user role' };
  }
}

export async function updateSiteSettings(
  settings: Array<{ key: string; value: string }>
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Upsert each setting
    for (const setting of settings) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: setting.key,
            value: setting.value,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'key' }
        );

      if (error) {
        return { error: error.message };
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      entity_type: 'site_settings',
      entity_id: 'bulk',
      new_data: { settings_count: settings.length },
      ip_address: null,
      user_agent: null,
    } as any);

    revalidatePath('/admin/settings');

    return { success: true };
  } catch (err) {
    console.error('Error updating site settings:', err);
    return { error: 'Failed to update settings' };
  }
}

export async function getSiteSettings() {
  try {
    const supabase = await createClient();
    type SiteSetting = {
      id: string;
      key: string;
      value: string;
      description: string | null;
    };

    const { data: rawData, error } = await supabase
      .from('site_settings')
      .select('id, key, value, description')
      .order('key');

    if (error) {
      return { error: error.message };
    }

    const data = (rawData || []) as SiteSetting[];

    // Group by category (extract from key: category_subcategory)
    const grouped = data.reduce(
      (acc, setting) => {
        const [category] = setting.key.split('_');
        if (!acc[category]) acc[category] = [];
        acc[category].push(setting);
        return acc;
      },
      {} as Record<string, SiteSetting[]>
    );

    return { success: true, data: grouped };
  } catch (err) {
    console.error('Error fetching site settings:', err);
    return { error: 'Failed to fetch settings' };
  }
}

export async function getAuditLogs(
  filters?: {
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  },
  page = 1,
  pageSize = 20
) {
  try {
    const supabase = createAdminClient();
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('audit_logs')
      .select(
        `
        id,
        action,
        entity_type,
        entity_id,
        ip_address,
        created_at
      `,
        { count: 'exact' }
      );

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return { error: error.message };
    }

    const normalizedData = (data || []).map((log: any) => ({
      ...log,
      old_data: null,
      new_data: null,
    }));

    return {
      success: true,
      data: normalizedData,
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return { error: 'Failed to fetch audit logs' };
  }
}

export async function getEventStats(eventId: string) {
  try {
    const supabase = await createClient();
    type RegistrationStat = {
      status: string;
      category: string;
    };
    type OrganizationRegistration = {
      profiles: {
        organization: string | null;
      } | null;
    };

    // Get all registrations for event
    const { data: registrationData, error: regError } = await supabase
      .from('registrations')
      .select('status, category')
      .eq('event_id', eventId);

    if (regError) {
      return { error: regError.message };
    }

    const registrations = (registrationData || []) as RegistrationStat[];
    const total = registrations?.length || 0;
    const statusBreakdown = registrations.reduce(
      (acc, reg) => {
        acc[reg.status] = (acc[reg.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const categoryBreakdown = registrations.reduce(
      (acc, reg) => {
        acc[reg.category] = (acc[reg.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get top organizations
    const { data: orgStats } = await supabase
      .from('registrations')
      .select('profiles!inner(organization)')
      .eq('event_id', eventId);

    const organizations = ((orgStats || []) as OrganizationRegistration[]).reduce(
      (acc, reg) => {
        const org = reg.profiles?.organization;
        if (org) {
          acc[org] = (acc[org] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const topOrganizations = Object.entries(organizations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      success: true,
      stats: {
        total,
        statusBreakdown,
        categoryBreakdown,
        topOrganizations,
      },
    };
  } catch (err) {
    console.error('Error fetching event stats:', err);
    return { error: 'Failed to fetch event stats' };
  }
}
