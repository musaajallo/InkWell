/**
 * Datamuse API Client
 *
 * Free API for rhyme suggestions, synonyms, and related words.
 * Used in the poem editor for rhyme helper panel.
 *
 * Base URL: https://api.datamuse.com
 * No API key required.
 */

import { API_URLS, API_TIMEOUT } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_EXPIRY, STORAGE_KEYS } from '@/utils/constants';

// ─── Types ───────────────────────────────────────────────────

export interface RhymeResult {
  word: string;
  score: number;
  numSyllables: number;
}

interface DatamuseWord {
  word: string;
  score: number;
  numSyllables?: number;
}

export interface RhymeSuggestions {
  perfect: RhymeResult[];
  near: RhymeResult[];
}

// ─── Cache ───────────────────────────────────────────────────

const CACHE_PREFIX = '@inkwell_rhyme_';

async function getCachedRhymes(word: string): Promise<RhymeSuggestions | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${word.toLowerCase()}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { data: RhymeSuggestions; cachedAt: number };
    const ageMs = Date.now() - parsed.cachedAt;
    const maxAgeMs = CACHE_EXPIRY.RHYME_RESULTS_DAYS * 24 * 60 * 60 * 1000;

    if (ageMs > maxAgeMs) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${word.toLowerCase()}`);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

async function setCachedRhymes(word: string, data: RhymeSuggestions): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${word.toLowerCase()}`,
      JSON.stringify({ data, cachedAt: Date.now() })
    );
  } catch {
    // Silently fail cache writes
  }
}

// ─── Helpers ─────────────────────────────────────────────────

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT.DATAMUSE);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function toRhymeResult(w: DatamuseWord): RhymeResult {
  return {
    word: w.word,
    score: w.score,
    numSyllables: w.numSyllables ?? 0,
  };
}

// ─── Public API ──────────────────────────────────────────────

/** Get perfect rhymes for a word. */
export async function getPerfectRhymes(word: string, max = 15): Promise<RhymeResult[]> {
  const encoded = encodeURIComponent(word.trim().toLowerCase());
  const response = await fetchWithTimeout(
    `${API_URLS.DATAMUSE}/words?rel_rhy=${encoded}&max=${max}`
  );

  if (!response.ok) {
    throw new Error(`Datamuse: HTTP ${response.status}`);
  }

  const data: DatamuseWord[] = await response.json();
  return data.map(toRhymeResult);
}

/** Get near rhymes for a word. */
export async function getNearRhymes(word: string, max = 15): Promise<RhymeResult[]> {
  const encoded = encodeURIComponent(word.trim().toLowerCase());
  const response = await fetchWithTimeout(
    `${API_URLS.DATAMUSE}/words?rel_nry=${encoded}&max=${max}`
  );

  if (!response.ok) {
    throw new Error(`Datamuse: HTTP ${response.status}`);
  }

  const data: DatamuseWord[] = await response.json();
  return data.map(toRhymeResult);
}

/**
 * Get both perfect and near rhymes for a word, with caching.
 * Returns up to 15 results per category.
 */
export async function getRhymeSuggestions(word: string): Promise<RhymeSuggestions> {
  const trimmed = word.trim().toLowerCase();
  if (!trimmed) return { perfect: [], near: [] };

  // Check cache
  const cached = await getCachedRhymes(trimmed);
  if (cached) return cached;

  // Fetch both in parallel
  const [perfect, near] = await Promise.all([
    getPerfectRhymes(trimmed),
    getNearRhymes(trimmed),
  ]);

  const result: RhymeSuggestions = { perfect, near };

  // Cache result
  setCachedRhymes(trimmed, result);

  return result;
}
