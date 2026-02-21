/**
 * PoetryDB API Client
 *
 * Free public API for classic poetry. Used for:
 * - Daily poem (random poem)
 * - Import by author or title search
 *
 * Base URL: https://poetrydb.org
 * No API key required.
 */

import { API_URLS, API_TIMEOUT } from '@/utils/constants';
import type { DailyPoem } from '@/types';

// ─── Response types ─────────────────────────────────────────

interface PoetryDBPoem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

interface PoetryDBError {
  status: number;
  reason: string;
}

type PoetryDBResponse = PoetryDBPoem[] | PoetryDBError;

// ─── Helpers ─────────────────────────────────────────────────

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT.POETRY_DB);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function isErrorResponse(data: PoetryDBResponse): data is PoetryDBError {
  return 'status' in data && 'reason' in data;
}

function toAppPoem(poem: PoetryDBPoem): DailyPoem {
  return {
    title: poem.title,
    author: poem.author,
    lines: poem.lines,
    linecount: poem.linecount,
  };
}

// ─── Public API ──────────────────────────────────────────────

/** Get a random poem from PoetryDB. */
export async function getRandomPoem(): Promise<DailyPoem> {
  const response = await fetchWithTimeout(`${API_URLS.POETRY_DB}/random`);
  if (!response.ok) {
    throw new Error(`PoetryDB: HTTP ${response.status}`);
  }

  const data: PoetryDBResponse = await response.json();
  if (isErrorResponse(data)) {
    throw new Error(`PoetryDB: ${data.reason}`);
  }
  if (data.length === 0) {
    throw new Error('PoetryDB: No poems returned');
  }

  return toAppPoem(data[0]);
}

/** Search poems by author name. */
export async function searchByAuthor(author: string): Promise<DailyPoem[]> {
  const encoded = encodeURIComponent(author);
  const response = await fetchWithTimeout(`${API_URLS.POETRY_DB}/author/${encoded}`);
  if (!response.ok) {
    throw new Error(`PoetryDB: HTTP ${response.status}`);
  }

  const data: PoetryDBResponse = await response.json();
  if (isErrorResponse(data)) {
    return []; // No results
  }

  return data.map(toAppPoem);
}

/** Search poems by title. */
export async function searchByTitle(title: string): Promise<DailyPoem[]> {
  const encoded = encodeURIComponent(title);
  const response = await fetchWithTimeout(`${API_URLS.POETRY_DB}/title/${encoded}`);
  if (!response.ok) {
    throw new Error(`PoetryDB: HTTP ${response.status}`);
  }

  const data: PoetryDBResponse = await response.json();
  if (isErrorResponse(data)) {
    return [];
  }

  return data.map(toAppPoem);
}
