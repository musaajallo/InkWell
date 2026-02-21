/**
 * useApiKeys
 *
 * Hook for managing API keys stored in SecureStore.
 * Provides get/set/clear for OpenAI and ElevenLabs keys.
 */

import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEYS } from '../utils/constants';
import type { ApiKeys } from '../types';

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load keys on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SECURE_STORE_KEYS.API_KEYS);
        if (raw) {
          const parsed: ApiKeys = JSON.parse(raw);
          setKeys(parsed);
        }
      } catch {
        // Keys not found or parse error — use empty
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (updated: ApiKeys) => {
    setKeys(updated);
    try {
      await SecureStore.setItemAsync(
        SECURE_STORE_KEYS.API_KEYS,
        JSON.stringify(updated)
      );
    } catch {
      // SecureStore write failed — log silently
    }
  }, []);

  const setAnthropicKey = useCallback(
    (key: string) => {
      const updated = { ...keys, anthropic: key || undefined };
      if (!key) delete updated.anthropic;
      persist(updated);
    },
    [keys, persist]
  );

  const setElevenLabsKey = useCallback(
    (key: string) => {
      const updated = { ...keys, elevenlabs: key || undefined };
      if (!key) delete updated.elevenlabs;
      persist(updated);
    },
    [keys, persist]
  );

  const clearAnthropicKey = useCallback(() => {
    const updated = { ...keys };
    delete updated.anthropic;
    persist(updated);
  }, [keys, persist]);

  const clearElevenLabsKey = useCallback(() => {
    const updated = { ...keys };
    delete updated.elevenlabs;
    persist(updated);
  }, [keys, persist]);

  const clearAllKeys = useCallback(() => {
    persist({});
  }, [persist]);

  return {
    keys,
    isLoaded,
    setAnthropicKey,
    setElevenLabsKey,
    clearAnthropicKey,
    clearElevenLabsKey,
    clearAllKeys,
    hasAnthropicKey: Boolean(keys.anthropic),
    hasElevenLabsKey: Boolean(keys.elevenlabs),
  };
}
