/**
 * Prompt Service
 *
 * Supabase operations for writing prompts and per-user prompt state.
 */

import { supabase } from '@/lib/supabase';
import type { WritingPrompt, PromptCategory } from '@/types';
import type { WritingPromptRow, UserPromptStateRow } from '@/types/database';

// ─── Row <-> App Type Converter ─────────────────────────────

function rowToPrompt(
  row: WritingPromptRow,
  state?: UserPromptStateRow
): WritingPrompt {
  return {
    id: row.id,
    text: row.text,
    category: row.category as PromptCategory,
    isFavorite: state?.is_favorite ?? false,
    isUsed: state?.is_used ?? false,
  };
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch all prompts with the current user's state merged in. */
export async function fetchPrompts(): Promise<WritingPrompt[]> {
  const { data: rows, error } = await supabase
    .from('writing_prompts')
    .select('*');

  if (error) throw new Error(`fetchPrompts: ${error.message}`);
  if (!rows || rows.length === 0) return [];

  // Fetch user state
  const { data: stateRows } = await supabase
    .from('user_prompt_state')
    .select('*');

  const stateMap = new Map<string, UserPromptStateRow>();
  for (const s of (stateRows ?? []) as UserPromptStateRow[]) {
    stateMap.set(s.prompt_id, s);
  }

  return (rows as WritingPromptRow[]).map((r) => rowToPrompt(r, stateMap.get(r.id)));
}

/** Fetch prompts by category. */
export async function fetchPromptsByCategory(
  category: PromptCategory
): Promise<WritingPrompt[]> {
  const { data: rows, error } = await supabase
    .from('writing_prompts')
    .select('*')
    .eq('category', category);

  if (error) throw new Error(`fetchPromptsByCategory: ${error.message}`);

  const { data: stateRows } = await supabase
    .from('user_prompt_state')
    .select('*');

  const stateMap = new Map<string, UserPromptStateRow>();
  for (const s of (stateRows ?? []) as UserPromptStateRow[]) {
    stateMap.set(s.prompt_id, s);
  }

  return ((rows ?? []) as WritingPromptRow[]).map((r) =>
    rowToPrompt(r, stateMap.get(r.id))
  );
}

/** Get a random prompt, optionally filtered by category. Uses DB function. */
export async function getRandomPrompt(
  category?: PromptCategory
): Promise<WritingPrompt | null> {
  const { data, error } = await supabase.rpc('get_random_prompt', {
    cat: category ?? null,
  });

  if (error) throw new Error(`getRandomPrompt: ${error.message}`);
  const rows = data as WritingPromptRow[] | null;
  if (!rows || rows.length === 0) return null;

  // Fetch state for this prompt
  const { data: stateRows } = await supabase
    .from('user_prompt_state')
    .select('*')
    .eq('prompt_id', rows[0].id)
    .maybeSingle();

  return rowToPrompt(rows[0], (stateRows as UserPromptStateRow) ?? undefined);
}

/** Mark a prompt as favorite. */
export async function togglePromptFavorite(
  userId: string,
  promptId: string,
  isFavorite: boolean
): Promise<void> {
  const { error } = await supabase
    .from('user_prompt_state')
    .upsert(
      { user_id: userId, prompt_id: promptId, is_favorite: isFavorite },
      { onConflict: 'user_id,prompt_id' }
    );
  if (error) throw new Error(`togglePromptFavorite: ${error.message}`);
}

/** Mark a prompt as used. */
export async function markPromptUsed(
  userId: string,
  promptId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_prompt_state')
    .upsert(
      { user_id: userId, prompt_id: promptId, is_used: true },
      { onConflict: 'user_id,prompt_id' }
    );
  if (error) throw new Error(`markPromptUsed: ${error.message}`);
}
