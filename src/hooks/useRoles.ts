'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/types/database';

type SystemRole = Database['public']['Enums']['system_role'];

export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id);

      setRoles(data?.map((r: any) => r.roles?.name as SystemRole) || []);
      setLoading(false);
    };

    fetchRoles();
  }, [user, supabase]);

  return {
    roles,
    loading,
    hasRole: (role: SystemRole) => roles.includes(role),
    isAdmin: roles.some(r => ['super_admin', 'event_admin', 'content_admin'].includes(r)),
    canReview: roles.some(r => ['super_admin', 'event_admin', 'reviewer'].includes(r)),
    canManageContent: roles.some(r => ['super_admin', 'content_admin'].includes(r)),
    canManageEvents: roles.some(r => ['super_admin', 'event_admin'].includes(r)),
    canCheckIn: roles.some(r => ['super_admin', 'event_admin', 'checkin_staff'].includes(r)),
  };
}
