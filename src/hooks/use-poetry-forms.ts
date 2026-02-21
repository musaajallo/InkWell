/**
 * usePoetryForms Hook
 *
 * Fetches poetry forms from Supabase. Provides both the full list
 * and a lookup-by-slug function for detail screens.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchPoetryForms,
  fetchPoetryFormBySlug,
} from '@/services/poetry-form-service';
import type { PoetryForm, PoetryFormSlug } from '@/types';

// ─── Hook for the list of all forms ──────────────────────────

interface UsePoetryFormsResult {
  forms: PoetryForm[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePoetryForms(): UsePoetryFormsResult {
  const [forms, setForms] = useState<PoetryForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPoetryForms();
      setForms(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load poetry forms';
      console.warn('usePoetryForms error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { forms, loading, error, refresh: load };
}

// ─── Hook for a single form by slug ─────────────────────────

interface UsePoetryFormResult {
  form: PoetryForm | null;
  loading: boolean;
  error: string | null;
}

export function usePoetryForm(slug: string): UsePoetryFormResult {
  const [form, setForm] = useState<PoetryForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPoetryFormBySlug(slug as PoetryFormSlug);
        if (!cancelled) setForm(data);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load poetry form';
          console.warn('usePoetryForm error:', msg);
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  return { form, loading, error };
}
