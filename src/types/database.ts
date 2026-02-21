/**
 * Database Row Types
 *
 * TypeScript types matching the Supabase database schema.
 * These represent the raw row shapes returned by Supabase queries.
 * Service functions convert between these and the app-level types in @/types.
 */

// ─── Poems ───────────────────────────────────────────────────

export interface PoemRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  tags: string[];
  form_type: string | null;
  status: 'draft' | 'complete';
  is_favorite: boolean;
  word_count: number;
  line_count: number;
  prompt_id: string | null;
  source_type: 'original' | 'imported' | 'dictated' | 'poetrydb';
  import_method: string | null;
  source_author: string | null;
  source_url: string | null;
  source_book: string | null;
  imported_at: string | null;
  poetrydb_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PoemInsert {
  user_id: string;
  title?: string;
  body?: string;
  tags?: string[];
  form_type?: string | null;
  status?: 'draft' | 'complete';
  is_favorite?: boolean;
  word_count?: number;
  line_count?: number;
  prompt_id?: string | null;
  source_type?: 'original' | 'imported' | 'dictated' | 'poetrydb';
  import_method?: string | null;
  source_author?: string | null;
  source_url?: string | null;
  source_book?: string | null;
  imported_at?: string | null;
  poetrydb_id?: string | null;
}

export interface PoemUpdate {
  title?: string;
  body?: string;
  tags?: string[];
  form_type?: string | null;
  status?: 'draft' | 'complete';
  is_favorite?: boolean;
  word_count?: number;
  line_count?: number;
  prompt_id?: string | null;
  source_type?: 'original' | 'imported' | 'dictated' | 'poetrydb';
  import_method?: string | null;
  source_author?: string | null;
  source_url?: string | null;
  source_book?: string | null;
  imported_at?: string | null;
  poetrydb_id?: string | null;
}

// ─── Collections ─────────────────────────────────────────────

export interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_color: string;
  icon_name: string;
  is_default: boolean;
  is_anthology: boolean;
  poem_order: string[];
  anthology_subtitle: string | null;
  anthology_author_bio: string | null;
  anthology_dedication: string | null;
  anthology_foreword: string | null;
  anthology_cover_image: string | null;
  anthology_include_reviews: boolean;
  anthology_published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionInsert {
  user_id: string;
  name: string;
  description?: string;
  cover_color?: string;
  icon_name?: string;
  is_default?: boolean;
  is_anthology?: boolean;
  poem_order?: string[];
}

export interface CollectionUpdate {
  name?: string;
  description?: string;
  cover_color?: string;
  icon_name?: string;
  is_anthology?: boolean;
  poem_order?: string[];
  anthology_subtitle?: string | null;
  anthology_author_bio?: string | null;
  anthology_dedication?: string | null;
  anthology_foreword?: string | null;
  anthology_cover_image?: string | null;
  anthology_include_reviews?: boolean;
  anthology_published_at?: string | null;
}

// ─── Poem Collections (join) ─────────────────────────────────

export interface PoemCollectionRow {
  poem_id: string;
  collection_id: string;
  added_at: string;
}

// ─── Section Dividers ────────────────────────────────────────

export interface SectionDividerRow {
  id: string;
  collection_id: string;
  after_poem_id: string;
  heading: string;
  subtitle: string | null;
  created_at: string;
}

// ─── Poem Reviews ────────────────────────────────────────────

export interface PoemReviewRow {
  id: string;
  poem_id: string;
  user_id: string;
  summary: string;
  themes: unknown; // jsonb — parsed to ReviewTheme[]
  literary_devices: unknown; // jsonb — parsed to LiteraryDevice[]
  structure_analysis: string;
  interpretation: string;
  tone: 'academic' | 'casual' | 'encouraging';
  personal_notes: string;
  poem_body_hash: string;
  generated_at: string;
}

export interface PoemReviewInsert {
  poem_id: string;
  user_id: string;
  summary: string;
  themes: unknown;
  literary_devices: unknown;
  structure_analysis: string;
  interpretation: string;
  tone: 'academic' | 'casual' | 'encouraging';
  personal_notes?: string;
  poem_body_hash: string;
}

// ─── Audio Recitations ──────────────────────────────────────

export interface AudioRecitationRow {
  id: string;
  poem_id: string;
  user_id: string;
  file_uri: string;
  video_uri: string | null;
  voice_id: string;
  voice_name: string;
  pace: 'slow' | 'normal' | 'dramatic';
  background_track: string | null;
  duration_seconds: number;
  file_size_bytes: number;
  generated_at: string;
}

export interface AudioRecitationInsert {
  poem_id: string;
  user_id: string;
  file_uri: string;
  video_uri?: string | null;
  voice_id: string;
  voice_name: string;
  pace?: 'slow' | 'normal' | 'dramatic';
  background_track?: string | null;
  duration_seconds: number;
  file_size_bytes: number;
}

// ─── Writing Prompts ─────────────────────────────────────────

export interface WritingPromptRow {
  id: string;
  text: string;
  category: 'emotion' | 'nature' | 'memory' | 'abstract' | 'story' | 'observation';
}

// ─── User Prompt State ──────────────────────────────────────

export interface UserPromptStateRow {
  user_id: string;
  prompt_id: string;
  is_favorite: boolean;
  is_used: boolean;
}

// ─── Poetry Forms ────────────────────────────────────────────

export interface PoetryFormRow {
  slug: string;
  name: string;
  origin: string;
  description: string;
  rules: string[];
  rhyme_scheme: string | null;
  line_count: number | null;
  syllable_pattern: number[] | null;
  examples: unknown; // jsonb — parsed to PoetryFormExample[]
}

// ─── Bundled Poems ──────────────────────────────────────────

export interface BundledPoemRow {
  id: string;
  title: string;
  author: string;
  lines: string[];
  line_count: number;
}

// ─── Daily Poem Cache ───────────────────────────────────────

export interface DailyPoemCacheRow {
  user_id: string;
  title: string;
  author: string;
  lines: string[];
  line_count: string;
  fetched_at: string;
}

// ─── User Settings ──────────────────────────────────────────

export interface UserSettingsRow {
  user_id: string;
  theme: string;
  editor_font_family: string;
  editor_font_size: string;
  show_syllable_counter: boolean;
  show_line_numbers: boolean;
  auto_save_interval: number;
  tts_rate: number;
  share_watermark: boolean;
  default_collection_id: string | null;
  voice_recognition_lang: string;
  recitation_voice_id: string;
  recitation_pace: 'slow' | 'normal' | 'dramatic';
  review_tone: 'academic' | 'casual' | 'encouraging';
  updated_at: string;
}

export interface UserSettingsUpdate {
  theme?: string;
  editor_font_family?: string;
  editor_font_size?: string;
  show_syllable_counter?: boolean;
  show_line_numbers?: boolean;
  auto_save_interval?: number;
  tts_rate?: number;
  share_watermark?: boolean;
  default_collection_id?: string | null;
  voice_recognition_lang?: string;
  recitation_voice_id?: string;
  recitation_pace?: 'slow' | 'normal' | 'dramatic';
  review_tone?: 'academic' | 'casual' | 'encouraging';
}

// ─── Profiles ────────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name?: string;
  avatar_url?: string | null;
}
