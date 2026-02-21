/**
 * Syllable Counter
 *
 * Heuristic vowel-cluster counting algorithm for syllable estimation.
 * Falls back gracefully for unknown or unusual words.
 */

const VOWELS = /[aeiouy]/i;
const VOWEL_CLUSTER = /[aeiouy]+/gi;
const SILENT_E = /[^l]e$/i;
const SPECIAL_ENDINGS = /(?:le|les|ed|es)$/i;

/**
 * Count syllables in a single word using heuristic rules.
 */
export function countSyllablesInWord(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length === 0) return 0;
  if (cleaned.length <= 2) return cleaned.match(VOWELS) ? 1 : 0;

  let count = 0;
  const matches = cleaned.match(VOWEL_CLUSTER);
  if (!matches) return 1; // Consonant-only word, treat as 1

  count = matches.length;

  // Subtract for silent 'e' at end (e.g., "make", "time")
  if (SILENT_E.test(cleaned)) {
    count = Math.max(1, count - 1);
  }

  // "-ed" endings that are silent (e.g., "walked" but not "wanted")
  if (/[^td]ed$/.test(cleaned)) {
    count = Math.max(1, count - 1);
  }

  return Math.max(1, count);
}

/**
 * Count total syllables in a line of text.
 */
export function countSyllablesInLine(line: string): number {
  const words = line.trim().split(/\s+/);
  if (words.length === 0 || (words.length === 1 && words[0] === '')) return 0;

  return words.reduce((total, word) => total + countSyllablesInWord(word), 0);
}

/**
 * Count syllables for each line of a poem body.
 * Returns an array of syllable counts corresponding to each line.
 */
export function countSyllablesPerLine(body: string): number[] {
  return body.split('\n').map(countSyllablesInLine);
}
