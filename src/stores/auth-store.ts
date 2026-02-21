/**
 * Auth Store
 *
 * Zustand store managing Supabase authentication state.
 * Provides sign-in, sign-up, sign-out, and session listeners.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

interface AuthStore {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function buildProfile(user: User | null): UserProfile | null {
  if (!user) return null;

  const email = user.email ?? '';
  const displayName =
    user.user_metadata?.display_name ??
    user.user_metadata?.full_name ??
    email.split('@')[0] ??
    'Poet';
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  const parts = displayName.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  return { displayName, email, avatarUrl, initials };
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: () => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        profile: buildProfile(session?.user ?? null),
        isInitialized: true,
      });
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        profile: buildProfile(session?.user ?? null),
      });
    });
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName ?? email.split('@')[0],
          },
        },
      });
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
