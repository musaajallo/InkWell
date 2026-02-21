/**
 * Settings Service
 *
 * Supabase operations for per-user app settings.
 */

import { supabase } from '@/lib/supabase';
import type { AppSettings, RecitationPace, ReviewTone } from '@/types';
import type { UserSettingsRow, UserSettingsUpdate } from '@/types/database';

// ─── Row <-> App Type Converters ─────────────────────────────

function rowToSettings(row: UserSettingsRow): AppSettings {
  return {
    theme: row.theme as AppSettings['theme'],
    editorFontFamily: row.editor_font_family as AppSettings['editorFontFamily'],
    editorFontSize: row.editor_font_size as AppSettings['editorFontSize'],
    showSyllableCounter: row.show_syllable_counter,
    showLineNumbers: row.show_line_numbers,
    autoSaveInterval: row.auto_save_interval,
    ttsRate: row.tts_rate,
    shareWatermark: row.share_watermark,
    defaultCollectionId: row.default_collection_id ?? '',
    voiceRecognitionLang: row.voice_recognition_lang,
    recitationVoiceId: row.recitation_voice_id,
    recitationPace: row.recitation_pace,
    reviewTone: row.review_tone,
  };
}

function settingsToUpdate(settings: Partial<AppSettings>): UserSettingsUpdate {
  const update: UserSettingsUpdate = {};
  if (settings.theme !== undefined) update.theme = settings.theme;
  if (settings.editorFontFamily !== undefined) update.editor_font_family = settings.editorFontFamily;
  if (settings.editorFontSize !== undefined) update.editor_font_size = settings.editorFontSize;
  if (settings.showSyllableCounter !== undefined) update.show_syllable_counter = settings.showSyllableCounter;
  if (settings.showLineNumbers !== undefined) update.show_line_numbers = settings.showLineNumbers;
  if (settings.autoSaveInterval !== undefined) update.auto_save_interval = settings.autoSaveInterval;
  if (settings.ttsRate !== undefined) update.tts_rate = settings.ttsRate;
  if (settings.shareWatermark !== undefined) update.share_watermark = settings.shareWatermark;
  if (settings.defaultCollectionId !== undefined) update.default_collection_id = settings.defaultCollectionId || null;
  if (settings.voiceRecognitionLang !== undefined) update.voice_recognition_lang = settings.voiceRecognitionLang;
  if (settings.recitationVoiceId !== undefined) update.recitation_voice_id = settings.recitationVoiceId;
  if (settings.recitationPace !== undefined) update.recitation_pace = settings.recitationPace;
  if (settings.reviewTone !== undefined) update.review_tone = settings.reviewTone;
  return update;
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch settings for the current user. Returns null if not found. */
export async function fetchSettings(userId: string): Promise<AppSettings | null> {
  const { data: row, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(`fetchSettings: ${error.message}`);
  if (!row) return null;
  return rowToSettings(row as UserSettingsRow);
}

/** Update settings for the current user. */
export async function updateSettings(
  userId: string,
  settings: Partial<AppSettings>
): Promise<void> {
  const update = settingsToUpdate(settings);

  const { error } = await supabase
    .from('user_settings')
    .update(update)
    .eq('user_id', userId);
  if (error) throw new Error(`updateSettings: ${error.message}`);
}

/** Reset settings to defaults. */
export async function resetSettings(userId: string): Promise<void> {
  const defaults: UserSettingsUpdate = {
    theme: 'system',
    editor_font_family: 'serif',
    editor_font_size: 'medium',
    show_syllable_counter: true,
    show_line_numbers: true,
    auto_save_interval: 30000,
    tts_rate: 1.0,
    share_watermark: true,
    default_collection_id: null,
    voice_recognition_lang: 'en-US',
    recitation_voice_id: '',
    recitation_pace: 'normal',
    review_tone: 'encouraging',
  };

  const { error } = await supabase
    .from('user_settings')
    .update(defaults)
    .eq('user_id', userId);
  if (error) throw new Error(`resetSettings: ${error.message}`);
}
