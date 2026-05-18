/**
 * @file authStore.ts
 * @description Zustand store for auth session, profile, and role state.
 *              Single source of truth for who is logged in and what role they have.
 * @module store
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types/auth';

interface AuthState {
  session:  Session | null;
  profile:  Profile | null;
  role:     UserRole | null;
  // Demo mode: role overriding without re-login
  demoRole: UserRole | null;

  setSession:  (session: Session | null) => void;
  setProfile:  (profile: Profile | null) => void;
  setDemoRole: (role: UserRole | null)  => void;
  clearAuth:   () => void;

  /** Effective role: demoRole overrides real role for demo mode */
  effectiveRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session:  null,
      profile:  null,
      role:     null,
      demoRole: null,

      setSession: (session) => set({ session }),
      setProfile: (profile) =>
        set({ profile, role: profile?.role ?? null }),
      setDemoRole: (demoRole) => set({ demoRole }),
      clearAuth: () =>
        set({ session: null, profile: null, role: null, demoRole: null }),

      effectiveRole: () => get().demoRole ?? get().role,
    }),
    {
      name: 'atomq-auth',
      partialize: (s) => ({
        profile:  s.profile,
        role:     s.role,
        demoRole: s.demoRole,
      }),
    },
  ),
);
