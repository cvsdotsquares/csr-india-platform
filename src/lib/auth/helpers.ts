import type { Database } from '@/types/database';
import { createClient } from '@/lib/supabase/server';

export type UserRole = Database['public']['Enums']['system_role'];

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId);

  return (data?.map((r: any) => r.roles?.name as UserRole) || []);
}

export function hasRole(roles: UserRole[], role: UserRole): boolean {
  return roles.includes(role);
}

export function isAdmin(roles: UserRole[]): boolean {
  return roles.some(r => ['super_admin', 'event_admin', 'content_admin'].includes(r));
}

export function canReview(roles: UserRole[]): boolean {
  return roles.some(r => ['super_admin', 'event_admin', 'reviewer'].includes(r));
}

export function canManageContent(roles: UserRole[]): boolean {
  return roles.some(r => ['super_admin', 'content_admin'].includes(r));
}

export function canManageEvents(roles: UserRole[]): boolean {
  return roles.some(r => ['super_admin', 'event_admin'].includes(r));
}

export function canCheckIn(roles: UserRole[]): boolean {
  return roles.some(r => ['super_admin', 'event_admin', 'checkin_staff'].includes(r));
}
