/**
 * Text Formatting Utilities
 *
 * Helpers for poem text processing: word count, line count, preview generation.
 */

/**
 * Count words in a text string.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Count non-empty lines in a poem.
 */
export function countLines(text: string): number {
  if (text.trim().length === 0) return 0;
  return text.split('\n').filter((line) => line.trim().length > 0).length;
}

/**
 * Generate a short preview of a poem (first 2 lines).
 */
export function generatePreview(body: string, maxLines = 2): string {
  const lines = body.split('\n').filter((l) => l.trim().length > 0);
  return lines.slice(0, maxLines).join('\n');
}

/**
 * Split poem text into stanzas (separated by blank lines).
 */
export function splitStanzas(body: string): string[][] {
  const lines = body.split('\n');
  const stanzas: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (current.length > 0) {
        stanzas.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    stanzas.push(current);
  }

  return stanzas;
}

/**
 * Simple hash of poem body text for cache invalidation.
 * Uses a basic djb2 hash algorithm -- not cryptographic, just for comparison.
 */
export function hashPoemBody(body: string): string {
  let hash = 5381;
  for (let i = 0; i < body.length; i++) {
    hash = ((hash << 5) + hash + body.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}
