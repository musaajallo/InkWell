/**
 * useWritingPrompts Hook
 *
 * Fetches writing prompts from Supabase. Supports shuffling to a random
 * prompt and fetching by category.
 */

import { useState, useEffect, useCallback } from 'react';
import { getRandomPrompt, fetchPrompts } from '@/services/prompt-service';
import type { WritingPrompt, PromptCategory } from '@/types';

interface UseWritingPromptsResult {
  /** All prompts (loaded lazily, may be empty initially) */
  prompts: WritingPrompt[];
  /** The current single prompt (for display) */
  currentPrompt: WritingPrompt | null;
  loading: boolean;
  error: string | null;
  /** Get a new random prompt, optionally filtered by category */
  shuffle: (category?: PromptCategory) => void;
}

export function useWritingPrompts(): UseWritingPromptsResult {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial random prompt
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const random = await getRandomPrompt();
        if (!cancelled && random) {
          setCurrentPrompt(random);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load prompt';
          console.warn('useWritingPrompts init error:', msg);
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Lazy-load all prompts (for category counts, etc.)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const all = await fetchPrompts();
        if (!cancelled) setPrompts(all);
      } catch (err) {
        console.warn('useWritingPrompts fetchAll error:', err);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const shuffle = useCallback(async (category?: PromptCategory) => {
    try {
      setLoading(true);
      setError(null);
      const random = await getRandomPrompt(category);
      if (random) {
        setCurrentPrompt(random);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to shuffle prompt';
      console.warn('useWritingPrompts shuffle error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { prompts, currentPrompt, loading, error, shuffle };
}
