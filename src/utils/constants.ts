/**
 * InkWell Constants
 *
 * Storage keys, API configuration, cache expiry, and other app-wide constants.
 * All storage keys prefixed with @inkwell_ per project conventions.
 */

// ─── Storage Keys ────────────────────────────────────────────

export const STORAGE_KEYS = {
  POEMS: '@inkwell_poems',
  COLLECTIONS: '@inkwell_collections',
  RECITATIONS: '@inkwell_recitations',
  PROMPTS_STATE: '@inkwell_prompts_state',
  SETTINGS: '@inkwell_settings',
  DAILY_POEM: '@inkwell_daily_poem',
  RHYME_CACHE: '@inkwell_rhyme_cache',
  REVIEW_CACHE: '@inkwell_review_cache',
} as const;

export const SECURE_STORE_KEYS = {
  API_KEYS: '@inkwell_api_keys',
} as const;

// ─── API Configuration ──────────────────────────────────────

export const API_URLS = {
  POETRY_DB: 'https://poetrydb.org',
  DATAMUSE: 'https://api.datamuse.com',
  ANTHROPIC: 'https://api.anthropic.com/v1',
  ELEVENLABS: 'https://api.elevenlabs.io/v1',
} as const;

export const API_TIMEOUT = {
  POETRY_DB: 10_000,
  DATAMUSE: 5_000,
  ANTHROPIC: 30_000,
  ELEVENLABS: 60_000,
} as const;

// ─── Cache Expiry ────────────────────────────────────────────

export const CACHE_EXPIRY = {
  DAILY_POEM_HOURS: 24,
  RHYME_RESULTS_DAYS: 30, // Rhyme results rarely change
} as const;

// ─── Rate Limits (app-side, free tier) ───────────────────────

export const FREE_TIER_LIMITS = {
  MAX_COLLECTIONS: 3, // Plus 2 defaults (All Poems, Drafts)
  REVIEWS_PER_DAY: 3,
  RECITATIONS_PER_DAY: 2,
} as const;

// ─── Editor Defaults ─────────────────────────────────────────

export const EDITOR_DEFAULTS = {
  AUTO_SAVE_INTERVAL_MS: 30_000,
  FONT_SIZE_MAP: {
    small: 14,
    medium: 16,
    large: 20,
  },
} as const;

// ─── Default Collections ─────────────────────────────────────

export const DEFAULT_COLLECTION_IDS = {
  ALL_POEMS: 'all-poems',
  DRAFTS: 'drafts',
} as const;

// ─── Anthropic ───────────────────────────────────────────────

export const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

// ─── TTS ─────────────────────────────────────────────────────

export const TTS_DEFAULTS = {
  RATE: 1.0,
  MIN_RATE: 0.5,
  MAX_RATE: 2.0,
} as const;
