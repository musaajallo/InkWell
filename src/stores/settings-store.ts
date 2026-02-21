/**
 * Settings Store
 *
 * Zustand store for app settings.
 * Local-first with Supabase sync: optimistic updates + background persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, RecitationPace, ReviewTone } from '@/types';
import { STORAGE_KEYS, DEFAULT_COLLECTION_IDS } from '@/utils/constants';
import * as SettingsService from '@/services/settings-service';

// ─── Defaults ────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  editorFontFamily: 'serif',
  editorFontSize: 'medium',
  showSyllableCounter: true,
  showLineNumbers: true,
  autoSaveInterval: 30_000,
  ttsRate: 1.0,
  shareWatermark: true,
  defaultCollectionId: DEFAULT_COLLECTION_IDS.ALL_POEMS,
  voiceRecognitionLang: 'en-US',
  recitationVoiceId: '',
  recitationPace: 'normal',
  reviewTone: 'encouraging',
};

// ─── Store Interface ─────────────────────────────────────────

interface SettingsStore {
  settings: AppSettings;
  isLoaded: boolean;
  isSyncing: boolean;
  syncError: string | null;

  // Sync
  fetchFromServer: (userId: string) => Promise<void>;

  // Setters
  updateSettings: (partial: Partial<AppSettings>, userId?: string) => void;
  setTheme: (theme: AppSettings['theme'], userId?: string) => void;
  setEditorFontFamily: (family: AppSettings['editorFontFamily'], userId?: string) => void;
  setEditorFontSize: (size: AppSettings['editorFontSize'], userId?: string) => void;
  setTtsRate: (rate: number, userId?: string) => void;
  setRecitationPace: (pace: RecitationPace, userId?: string) => void;
  setReviewTone: (tone: ReviewTone, userId?: string) => void;
  toggleSyllableCounter: (userId?: string) => void;
  toggleLineNumbers: (userId?: string) => void;
  toggleShareWatermark: (userId?: string) => void;

  // Reset
  resetToDefaults: (userId?: string) => void;
}

// ── Background sync helper ──────────────────────────────────

function syncToServer(userId: string | undefined, partial: Partial<AppSettings>): void {
  if (!userId) return;
  SettingsService.updateSettings(userId, partial).catch((err) => {
    console.warn('SettingsStore sync failed:', err);
  });
}

// ─── Store Implementation ────────────────────────────────────

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS },
      isLoaded: false,
      isSyncing: false,
      syncError: null,

      // ── Fetch settings from Supabase ──────────────────────
      fetchFromServer: async (userId: string) => {
        set({ isSyncing: true, syncError: null });
        try {
          const serverSettings = await SettingsService.fetchSettings(userId);
          if (serverSettings) {
            set({ settings: serverSettings, isSyncing: false });
          } else {
            set({ isSyncing: false });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch settings';
          set({ isSyncing: false, syncError: msg });
          console.warn('SettingsStore.fetchFromServer:', msg);
        }
      },

      // ── Generic update ────────────────────────────────────
      updateSettings: (partial: Partial<AppSettings>, userId?: string) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
        syncToServer(userId, partial);
      },

      // ── Individual setters ────────────────────────────────
      setTheme: (theme, userId) => {
        set((state) => ({ settings: { ...state.settings, theme } }));
        syncToServer(userId, { theme });
      },

      setEditorFontFamily: (editorFontFamily, userId) => {
        set((state) => ({ settings: { ...state.settings, editorFontFamily } }));
        syncToServer(userId, { editorFontFamily });
      },

      setEditorFontSize: (editorFontSize, userId) => {
        set((state) => ({ settings: { ...state.settings, editorFontSize } }));
        syncToServer(userId, { editorFontSize });
      },

      setTtsRate: (ttsRate, userId) => {
        set((state) => ({ settings: { ...state.settings, ttsRate } }));
        syncToServer(userId, { ttsRate });
      },

      setRecitationPace: (recitationPace, userId) => {
        set((state) => ({ settings: { ...state.settings, recitationPace } }));
        syncToServer(userId, { recitationPace });
      },

      setReviewTone: (reviewTone, userId) => {
        set((state) => ({ settings: { ...state.settings, reviewTone } }));
        syncToServer(userId, { reviewTone });
      },

      toggleSyllableCounter: (userId) => {
        const next = !get().settings.showSyllableCounter;
        set((state) => ({
          settings: { ...state.settings, showSyllableCounter: next },
        }));
        syncToServer(userId, { showSyllableCounter: next });
      },

      toggleLineNumbers: (userId) => {
        const next = !get().settings.showLineNumbers;
        set((state) => ({
          settings: { ...state.settings, showLineNumbers: next },
        }));
        syncToServer(userId, { showLineNumbers: next });
      },

      toggleShareWatermark: (userId) => {
        const next = !get().settings.shareWatermark;
        set((state) => ({
          settings: { ...state.settings, shareWatermark: next },
        }));
        syncToServer(userId, { shareWatermark: next });
      },

      // ── Reset ─────────────────────────────────────────────
      resetToDefaults: (userId) => {
        set({ settings: { ...DEFAULT_SETTINGS } });
        if (userId) {
          SettingsService.resetSettings(userId).catch((err) => {
            console.warn('SettingsStore.resetToDefaults sync failed:', err);
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
      },
    }
  )
);
