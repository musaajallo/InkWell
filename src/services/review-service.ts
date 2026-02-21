/**
 * Review Service
 *
 * Supabase CRUD operations for poem reviews.
 */

import { supabase } from '@/lib/supabase';
import type {
  PoemReview,
  ReviewTheme,
  LiteraryDevice,
  ReviewTone,
} from '@/types';
import type { PoemReviewRow, PoemReviewInsert } from '@/types/database';

// ─── Row <-> App Type Converters ─────────────────────────────

function rowToReview(row: PoemReviewRow): PoemReview {
  return {
    id: row.id,
    poemId: row.poem_id,
    summary: row.summary,
    themes: (row.themes as ReviewTheme[]) ?? [],
    literaryDevices: (row.literary_devices as LiteraryDevice[]) ?? [],
    structureAnalysis: row.structure_analysis,
    interpretation: row.interpretation,
    tone: row.tone,
    personalNotes: row.personal_notes,
    generatedAt: row.generated_at,
    poemBodyHash: row.poem_body_hash,
  };
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch the latest review for a poem. */
export async function fetchReviewForPoem(poemId: string): Promise<PoemReview | null> {
  const { data: row, error } = await supabase
    .from('poem_reviews')
    .select('*')
    .eq('poem_id', poemId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`fetchReviewForPoem: ${error.message}`);
  if (!row) return null;
  return rowToReview(row as PoemReviewRow);
}

/** Fetch all reviews for a poem (history). */
export async function fetchReviewHistory(poemId: string): Promise<PoemReview[]> {
  const { data: rows, error } = await supabase
    .from('poem_reviews')
    .select('*')
    .eq('poem_id', poemId)
    .order('generated_at', { ascending: false });

  if (error) throw new Error(`fetchReviewHistory: ${error.message}`);
  return ((rows ?? []) as PoemReviewRow[]).map(rowToReview);
}

/** Create a new review. Returns the created PoemReview. */
export async function createReview(input: {
  userId: string;
  poemId: string;
  summary: string;
  themes: ReviewTheme[];
  literaryDevices: LiteraryDevice[];
  structureAnalysis: string;
  interpretation: string;
  tone: ReviewTone;
  poemBodyHash: string;
  personalNotes?: string;
}): Promise<PoemReview> {
  const insert: PoemReviewInsert = {
    poem_id: input.poemId,
    user_id: input.userId,
    summary: input.summary,
    themes: input.themes as unknown,
    literary_devices: input.literaryDevices as unknown,
    structure_analysis: input.structureAnalysis,
    interpretation: input.interpretation,
    tone: input.tone,
    poem_body_hash: input.poemBodyHash,
    personal_notes: input.personalNotes ?? '',
  };

  const { data: row, error } = await supabase
    .from('poem_reviews')
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(`createReview: ${error.message}`);
  return rowToReview(row as PoemReviewRow);
}

/** Update personal notes on a review. */
export async function updateReviewNotes(
  reviewId: string,
  personalNotes: string
): Promise<void> {
  const { error } = await supabase
    .from('poem_reviews')
    .update({ personal_notes: personalNotes })
    .eq('id', reviewId);
  if (error) throw new Error(`updateReviewNotes: ${error.message}`);
}

/** Delete a review. */
export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('poem_reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw new Error(`deleteReview: ${error.message}`);
}
