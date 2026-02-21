/**
 * Recitation Service
 *
 * Supabase CRUD operations for audio recitation metadata.
 * (Actual audio files are stored locally via expo-file-system;
 *  this service manages the metadata rows.)
 */

import { supabase } from '@/lib/supabase';
import type { AudioRecitation, RecitationPace } from '@/types';
import type { AudioRecitationRow, AudioRecitationInsert } from '@/types/database';

// ─── Row <-> App Type Converter ─────────────────────────────

function rowToRecitation(row: AudioRecitationRow): AudioRecitation {
  return {
    id: row.id,
    poemId: row.poem_id,
    fileUri: row.file_uri,
    videoUri: row.video_uri,
    voiceId: row.voice_id,
    voiceName: row.voice_name,
    pace: row.pace,
    backgroundTrack: row.background_track,
    durationSeconds: row.duration_seconds,
    fileSizeBytes: row.file_size_bytes,
    generatedAt: row.generated_at,
  };
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch all recitations for a poem. */
export async function fetchRecitationsForPoem(poemId: string): Promise<AudioRecitation[]> {
  const { data: rows, error } = await supabase
    .from('audio_recitations')
    .select('*')
    .eq('poem_id', poemId)
    .order('generated_at', { ascending: false });

  if (error) throw new Error(`fetchRecitationsForPoem: ${error.message}`);
  return ((rows ?? []) as AudioRecitationRow[]).map(rowToRecitation);
}

/** Fetch all recitations for the current user. */
export async function fetchAllRecitations(): Promise<AudioRecitation[]> {
  const { data: rows, error } = await supabase
    .from('audio_recitations')
    .select('*')
    .order('generated_at', { ascending: false });

  if (error) throw new Error(`fetchAllRecitations: ${error.message}`);
  return ((rows ?? []) as AudioRecitationRow[]).map(rowToRecitation);
}

/** Create a recitation metadata record. */
export async function createRecitation(input: {
  userId: string;
  poemId: string;
  fileUri: string;
  videoUri?: string | null;
  voiceId: string;
  voiceName: string;
  pace?: RecitationPace;
  backgroundTrack?: string | null;
  durationSeconds: number;
  fileSizeBytes: number;
}): Promise<AudioRecitation> {
  const insert: AudioRecitationInsert = {
    poem_id: input.poemId,
    user_id: input.userId,
    file_uri: input.fileUri,
    video_uri: input.videoUri ?? null,
    voice_id: input.voiceId,
    voice_name: input.voiceName,
    pace: input.pace ?? 'normal',
    background_track: input.backgroundTrack ?? null,
    duration_seconds: input.durationSeconds,
    file_size_bytes: input.fileSizeBytes,
  };

  const { data: row, error } = await supabase
    .from('audio_recitations')
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(`createRecitation: ${error.message}`);
  return rowToRecitation(row as AudioRecitationRow);
}

/** Delete a recitation metadata record. */
export async function deleteRecitation(id: string): Promise<void> {
  const { error } = await supabase
    .from('audio_recitations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`deleteRecitation: ${error.message}`);
}
