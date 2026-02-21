/**
 * useDailyPoem Hook
 *
 * Fetches today's daily poem from Supabase cache or falls back to a random
 * bundled poem. Caches the result for the configured expiry period.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCachedDailyPoem,
  cacheDailyPoem,
  getRandomBundledPoem,
} from '@/services/daily-poem-service';
import { useAuthStore } from '@/stores/auth-store';
import type { DailyPoem } from '@/types';

interface UseDailyPoemResult {
  poem: DailyPoem | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDailyPoem(): UseDailyPoemResult {
  const userId = useAuthStore((s) => s.user?.id);
  const [poem, setPoem] = useState<DailyPoem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoem = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try cached daily poem
      if (userId) {
        const cached = await getCachedDailyPoem(userId);
        if (cached) {
          setPoem(cached.poem);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback: random bundled poem from DB
      const bundled = await getRandomBundledPoem();
      if (bundled) {
        setPoem(bundled);
        // Cache it for next time
        if (userId) {
          cacheDailyPoem(userId, bundled).catch((err) =>
            console.warn('Failed to cache daily poem:', err)
          );
        }
        setLoading(false);
        return;
      }

      // 3. Nothing available
      setPoem(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load daily poem';
      console.warn('useDailyPoem error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPoem();
  }, [fetchPoem]);

  return { poem, loading, error, refresh: fetchPoem };
}
