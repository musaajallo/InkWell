/**
 * Daily Poem Service
 *
 * Supabase operations for the daily poem cache and bundled poems fallback.
 */

import { supabase } from '@/lib/supabase';
import type { DailyPoem, DailyPoemCache } from '@/types';
import type { DailyPoemCacheRow, BundledPoemRow } from '@/types/database';
import { CACHE_EXPIRY } from '@/utils/constants';

// ─── Row <-> App Type Converters ─────────────────────────────

function cacheRowToAppType(row: DailyPoemCacheRow): DailyPoemCache {
  return {
    poem: {
      title: row.title,
      author: row.author,
      lines: row.lines,
      linecount: row.line_count,
    },
    fetchedAt: row.fetched_at,
  };
}

function bundledRowToDailyPoem(row: BundledPoemRow): DailyPoem {
  return {
    title: row.title,
    author: row.author,
    lines: row.lines,
    linecount: String(row.line_count),
  };
}

// ─── Service Functions ───────────────────────────────────────

/** Get the cached daily poem for the current user. Returns null if expired or missing. */
export async function getCachedDailyPoem(userId: string): Promise<DailyPoemCache | null> {
  const { data: row, error } = await supabase
    .from('daily_poem_cache')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(`getCachedDailyPoem: ${error.message}`);
  if (!row) return null;

  const cache = cacheRowToAppType(row as DailyPoemCacheRow);

  // Check expiry
  const fetchedAt = new Date(cache.fetchedAt).getTime();
  const expiryMs = CACHE_EXPIRY.DAILY_POEM_HOURS * 60 * 60 * 1000;
  if (Date.now() - fetchedAt > expiryMs) return null;

  return cache;
}

/** Save a daily poem to the cache (upsert). */
export async function cacheDailyPoem(userId: string, poem: DailyPoem): Promise<void> {
  const { error } = await supabase
    .from('daily_poem_cache')
    .upsert({
      user_id: userId,
      title: poem.title,
      author: poem.author,
      lines: poem.lines,
      line_count: poem.linecount,
      fetched_at: new Date().toISOString(),
    });
  if (error) throw new Error(`cacheDailyPoem: ${error.message}`);
}

/** Get a random bundled poem (offline fallback). Uses DB function. */
export async function getRandomBundledPoem(): Promise<DailyPoem | null> {
  const { data, error } = await supabase.rpc('get_random_bundled_poem');

  if (error) throw new Error(`getRandomBundledPoem: ${error.message}`);
  const rows = data as BundledPoemRow[] | null;
  if (!rows || rows.length === 0) return null;

  return bundledRowToDailyPoem(rows[0]);
}
