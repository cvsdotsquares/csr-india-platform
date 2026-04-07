import type { User } from '@supabase/supabase-js';
import type { Database } from './database';

export type SystemRole = Database['public']['Enums']['system_role'];

export interface AuthUser extends User {
  roles?: SystemRole[];
}

export interface SessionWithRoles {
  user: AuthUser;
  roles: SystemRole[];
}
