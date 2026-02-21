/**
 * Profile Service
 *
 * Supabase operations for user profiles.
 */

import { supabase } from '@/lib/supabase';
import type { ProfileRow, ProfileUpdate } from '@/types/database';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Row <-> App Type Converter ─────────────────────────────

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isPremium: row.is_premium,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch the current user's profile. */
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data: row, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`fetchProfile: ${error.message}`);
  if (!row) return null;
  return rowToProfile(row as ProfileRow);
}

/** Update the current user's profile. */
export async function updateProfile(
  userId: string,
  input: { displayName?: string; avatarUrl?: string | null }
): Promise<void> {
  const update: ProfileUpdate = {};
  if (input.displayName !== undefined) update.display_name = input.displayName;
  if (input.avatarUrl !== undefined) update.avatar_url = input.avatarUrl;

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId);
  if (error) throw new Error(`updateProfile: ${error.message}`);
}

/** Check if the current user has premium status. */
export async function checkPremiumStatus(userId: string): Promise<boolean> {
  const { data: row, error } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`checkPremiumStatus: ${error.message}`);
  return (row as Pick<ProfileRow, 'is_premium'> | null)?.is_premium ?? false;
}
