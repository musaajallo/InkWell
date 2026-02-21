/**
 * InkWell Data Models
 *
 * All core types and interfaces for the app,
 * matching the requirements document (Section 5).
 */

// ─── Poem ────────────────────────────────────────────────────

export interface Poem {
  id: string;
  title: string;
  body: string; // Raw poem text (stanzas separated by \n\n)
  tags: string[]; // e.g., ['haiku', 'nature', 'melancholy']
  formType: PoetryFormSlug | null; // e.g., 'haiku', 'sonnet', null for free verse
  status: PoemStatus;
  isFavorite: boolean;
  wordCount: number;
  lineCount: number;
  collectionIds: string[]; // Many-to-many relationship
  promptId: string | null; // Writing prompt that inspired this poem
  source: PoemSource;
  review: PoemReview | null; // AI-generated review (null if not yet generated)
  recitationIds: string[]; // IDs of generated AudioRecitation objects
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type PoemStatus = 'draft' | 'complete';

export type PoemSource =
  | { type: 'original' }
  | {
      type: 'imported';
      method: ImportMethod;
      author?: string;
      sourceUrl?: string;
      sourceBook?: string;
      importedAt: string;
    }
  | { type: 'dictated' }
  | { type: 'poetrydb'; poetryDbId?: string };

export type ImportMethod = 'text' | 'file' | 'clipboard' | 'ocr' | 'poetrydb' | 'url';

// ─── Collection ──────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverColor: string; // Hex color
  iconName: string; // Feather icon name
  isDefault: boolean; // true for "All Poems" and "Drafts"
  isAnthology: boolean; // true if promoted to anthology
  anthologyMeta: AnthologyMeta | null;
  poemOrder: string[]; // Ordered poem IDs for manual sorting
  sectionDividers: SectionDivider[];
  createdAt: string;
  updatedAt: string;
}

export interface AnthologyMeta {
  subtitle: string;
  authorBio: string;
  dedication: string;
  foreword: string;
  coverImageUri: string | null;
  includeReviews: boolean;
  publishedAt: string | null; // ISO 8601
}

export interface SectionDivider {
  afterPoemId: string; // Divider appears after this poem
  heading: string;
  subtitle?: string;
}

// ─── Poem Review ─────────────────────────────────────────────

export interface PoemReview {
  id: string;
  poemId: string;
  summary: string;
  themes: ReviewTheme[];
  literaryDevices: LiteraryDevice[];
  structureAnalysis: string;
  interpretation: string;
  tone: ReviewTone;
  personalNotes: string;
  generatedAt: string; // ISO 8601
  poemBodyHash: string; // Hash of poem body at generation time
}

export interface ReviewTheme {
  name: string;
  explanation: string;
}

export interface LiteraryDevice {
  device: string; // e.g., 'metaphor', 'alliteration'
  example: string; // Quoted text from the poem
  explanation: string;
}

export type ReviewTone = 'academic' | 'casual' | 'encouraging';

// ─── Audio Recitation ────────────────────────────────────────

export interface AudioRecitation {
  id: string;
  poemId: string;
  fileUri: string; // Local file path to MP3/WAV
  videoUri: string | null; // Local file path to MP4
  voiceId: string; // ElevenLabs voice ID used
  voiceName: string;
  pace: RecitationPace;
  backgroundTrack: string | null;
  durationSeconds: number;
  fileSizeBytes: number;
  generatedAt: string; // ISO 8601
}

export type RecitationPace = 'slow' | 'normal' | 'dramatic';

// ─── Writing Prompt ──────────────────────────────────────────

export interface WritingPrompt {
  id: string;
  text: string;
  category: PromptCategory;
  isFavorite: boolean;
  isUsed: boolean;
}

export type PromptCategory =
  | 'emotion'
  | 'nature'
  | 'memory'
  | 'abstract'
  | 'story'
  | 'observation';

// ─── Poetry Form ─────────────────────────────────────────────

export interface PoetryForm {
  slug: PoetryFormSlug;
  name: string;
  origin: string;
  description: string;
  rules: string[];
  rhymeScheme: string | null;
  lineCount: number | null;
  syllablePattern: number[] | null;
  examples: PoetryFormExample[];
}

export interface PoetryFormExample {
  title: string;
  author: string;
  text: string;
}

export type PoetryFormSlug =
  | 'haiku'
  | 'tanka'
  | 'sonnet-shakespearean'
  | 'sonnet-petrarchan'
  | 'limerick'
  | 'villanelle'
  | 'ghazal'
  | 'free-verse'
  | 'acrostic'
  | 'ballad'
  | 'ode'
  | 'elegy'
  | 'couplet';

// ─── App Settings ────────────────────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  editorFontFamily: 'monospace' | 'serif';
  editorFontSize: 'small' | 'medium' | 'large';
  showSyllableCounter: boolean;
  showLineNumbers: boolean;
  autoSaveInterval: number; // Milliseconds (default: 30000)
  ttsRate: number; // 0.5 - 2.0 (default: 1.0)
  shareWatermark: boolean;
  defaultCollectionId: string;
  voiceRecognitionLang: string; // BCP-47 (default: 'en-US')
  recitationVoiceId: string;
  recitationPace: RecitationPace;
  reviewTone: ReviewTone;
}

// ─── Daily Poem Cache ────────────────────────────────────────

export interface DailyPoemCache {
  poem: DailyPoem;
  fetchedAt: string; // ISO 8601
}

export interface DailyPoem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

// ─── Prompt State (persisted) ────────────────────────────────

export interface PromptState {
  favorites: string[]; // Prompt IDs
  used: string[]; // Prompt IDs
}

// ─── API Keys (stored in SecureStore) ────────────────────────

export interface ApiKeys {
  openai?: string;
  elevenlabs?: string;
}

// ─── PoetryDB API Response ───────────────────────────────────

export interface PoetryDbPoem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

// ─── Datamuse API Response ───────────────────────────────────

export interface DatamuseWord {
  word: string;
  score: number;
  numSyllables?: number;
}
