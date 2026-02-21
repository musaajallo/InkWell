/**
 * Poetry Form Service
 *
 * Supabase operations for the poetry_forms reference table.
 */

import { supabase } from '@/lib/supabase';
import type { PoetryForm, PoetryFormSlug, PoetryFormExample } from '@/types';
import type { PoetryFormRow } from '@/types/database';

// ─── Row <-> App Type Converter ─────────────────────────────

function rowToForm(row: PoetryFormRow): PoetryForm {
  return {
    slug: row.slug as PoetryFormSlug,
    name: row.name,
    origin: row.origin,
    description: row.description,
    rules: row.rules,
    rhymeScheme: row.rhyme_scheme,
    lineCount: row.line_count,
    syllablePattern: row.syllable_pattern,
    examples: (row.examples as PoetryFormExample[]) ?? [],
  };
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch all poetry forms. */
export async function fetchPoetryForms(): Promise<PoetryForm[]> {
  const { data: rows, error } = await supabase
    .from('poetry_forms')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`fetchPoetryForms: ${error.message}`);
  return ((rows ?? []) as PoetryFormRow[]).map(rowToForm);
}

/** Fetch a single poetry form by slug. */
export async function fetchPoetryFormBySlug(
  slug: PoetryFormSlug
): Promise<PoetryForm | null> {
  const { data: row, error } = await supabase
    .from('poetry_forms')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`fetchPoetryFormBySlug: ${error.message}`);
  }

  return rowToForm(row as PoetryFormRow);
}
