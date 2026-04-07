import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  roles: string[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRoles: (roles: string[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  roles: [],
  isLoading: true,
  setUser: (user) => set({ user }),
  setRoles: (roles) => set({ roles }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, roles: [], isLoading: false }),
}));
