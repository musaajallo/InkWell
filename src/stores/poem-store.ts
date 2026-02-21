/**
 * Poem Store
 *
 * Zustand store for poem CRUD operations.
 * Local-first with Supabase sync: optimistic updates + background persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { Poem, PoemSource, PoemStatus, PoemReview, PoetryFormSlug } from '@/types';
import { STORAGE_KEYS, DEFAULT_COLLECTION_IDS } from '@/utils/constants';
import { countWords, countLines, nowISO } from '@/utils';
import * as PoemService from '@/services/poem-service';

// ─── Input Types ─────────────────────────────────────────────

interface CreatePoemInput {
  title?: string;
  body?: string;
  formType?: PoetryFormSlug | null;
  source?: PoemSource;
  promptId?: string | null;
  collectionIds?: string[];
}

interface UpdatePoemInput {
  title?: string;
  body?: string;
  tags?: string[];
  formType?: PoetryFormSlug | null;
  status?: PoemStatus;
  isFavorite?: boolean;
  collectionIds?: string[];
  promptId?: string | null;
  review?: PoemReview | null;
}

// ─── Store Interface ─────────────────────────────────────────

interface PoemStore {
  poems: Poem[];
  isLoaded: boolean;
  isSyncing: boolean;
  syncError: string | null;

  // Sync
  fetchFromServer: (userId: string) => Promise<void>;

  // CRUD
  createPoem: (input?: CreatePoemInput, userId?: string) => Poem;
  updatePoem: (id: string, input: UpdatePoemInput) => void;
  deletePoem: (id: string) => void;
  getPoemById: (id: string) => Poem | undefined;

  // Queries
  getRecentDrafts: (limit?: number) => Poem[];
  getPoemsByCollection: (collectionId: string) => Poem[];
  getPoemsByStatus: (status: PoemStatus) => Poem[];
  searchPoems: (query: string) => Poem[];

  // Bulk
  addPoemToCollection: (poemId: string, collectionId: string) => void;
  removePoemFromCollection: (poemId: string, collectionId: string) => void;
  toggleFavorite: (poemId: string) => void;
}

// ─── Store Implementation ────────────────────────────────────

export const usePoemStore = create<PoemStore>()(
  persist(
    (set, get) => ({
      poems: [],
      isLoaded: false,
      isSyncing: false,
      syncError: null,

      // ── Fetch all poems from Supabase ─────────────────────
      fetchFromServer: async (userId: string) => {
        set({ isSyncing: true, syncError: null });
        try {
          const poems = await PoemService.fetchPoems();
          set({ poems, isSyncing: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch poems';
          set({ isSyncing: false, syncError: msg });
          console.warn('PoemStore.fetchFromServer:', msg);
        }
      },

      // ── Create ────────────────────────────────────────────
      createPoem: (input?: CreatePoemInput, userId?: string) => {
        const now = nowISO();
        const body = input?.body ?? '';
        const collectionIds = input?.collectionIds ?? [
          DEFAULT_COLLECTION_IDS.ALL_POEMS,
          DEFAULT_COLLECTION_IDS.DRAFTS,
        ];

        // Optimistic local poem with temp ID
        const tempId = Crypto.randomUUID();
        const newPoem: Poem = {
          id: tempId,
          title: input?.title ?? '',
          body,
          tags: [],
          formType: input?.formType ?? null,
          status: 'draft',
          isFavorite: false,
          wordCount: countWords(body),
          lineCount: countLines(body),
          collectionIds,
          promptId: input?.promptId ?? null,
          source: input?.source ?? { type: 'original' },
          review: null,
          recitationIds: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ poems: [newPoem, ...state.poems] }));

        // Background sync to Supabase
        if (userId) {
          PoemService.createPoem({
            userId,
            title: input?.title,
            body: input?.body,
            formType: input?.formType,
            source: input?.source,
            promptId: input?.promptId,
            collectionIds,
          })
            .then((serverPoem) => {
              // Replace temp poem with server poem (has real DB id)
              set((state) => ({
                poems: state.poems.map((p) =>
                  p.id === tempId ? serverPoem : p
                ),
              }));
            })
            .catch((err) => {
              console.warn('PoemStore.createPoem sync failed:', err);
            });
        }

        return newPoem;
      },

      // ── Update ────────────────────────────────────────────
      updatePoem: (id: string, input: UpdatePoemInput) => {
        set((state) => ({
          poems: state.poems.map((poem) => {
            if (poem.id !== id) return poem;
            const updatedBody = input.body !== undefined ? input.body : poem.body;
            return {
              ...poem,
              ...input,
              wordCount: input.body !== undefined ? countWords(updatedBody) : poem.wordCount,
              lineCount: input.body !== undefined ? countLines(updatedBody) : poem.lineCount,
              updatedAt: nowISO(),
            };
          }),
        }));

        // Background sync (excluding review & collectionIds which are handled separately)
        PoemService.updatePoem(id, {
          title: input.title,
          body: input.body,
          tags: input.tags,
          formType: input.formType,
          status: input.status,
          isFavorite: input.isFavorite,
          promptId: input.promptId,
        }).catch((err) => {
          console.warn('PoemStore.updatePoem sync failed:', err);
        });
      },

      // ── Delete ────────────────────────────────────────────
      deletePoem: (id: string) => {
        set((state) => ({
          poems: state.poems.filter((p) => p.id !== id),
        }));

        PoemService.deletePoem(id).catch((err) => {
          console.warn('PoemStore.deletePoem sync failed:', err);
        });
      },

      // ── Read ──────────────────────────────────────────────
      getPoemById: (id: string) => {
        return get().poems.find((p) => p.id === id);
      },

      getRecentDrafts: (limit = 5) => {
        return [...get().poems]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },

      getPoemsByCollection: (collectionId: string) => {
        if (collectionId === DEFAULT_COLLECTION_IDS.ALL_POEMS) {
          return get().poems;
        }
        if (collectionId === DEFAULT_COLLECTION_IDS.DRAFTS) {
          return get().poems.filter((p) => p.status === 'draft');
        }
        return get().poems.filter((p) => p.collectionIds.includes(collectionId));
      },

      getPoemsByStatus: (status: PoemStatus) => {
        return get().poems.filter((p) => p.status === status);
      },

      searchPoems: (query: string) => {
        const lower = query.toLowerCase();
        return get().poems.filter(
          (p) =>
            p.title.toLowerCase().includes(lower) ||
            p.body.toLowerCase().includes(lower) ||
            p.tags.some((t) => t.toLowerCase().includes(lower))
        );
      },

      // ── Collection linking ────────────────────────────────
      addPoemToCollection: (poemId: string, collectionId: string) => {
        set((state) => ({
          poems: state.poems.map((p) => {
            if (p.id !== poemId) return p;
            if (p.collectionIds.includes(collectionId)) return p;
            return {
              ...p,
              collectionIds: [...p.collectionIds, collectionId],
              updatedAt: nowISO(),
            };
          }),
        }));

        PoemService.addPoemToCollection(poemId, collectionId).catch((err) => {
          console.warn('PoemStore.addPoemToCollection sync failed:', err);
        });
      },

      removePoemFromCollection: (poemId: string, collectionId: string) => {
        set((state) => ({
          poems: state.poems.map((p) => {
            if (p.id !== poemId) return p;
            return {
              ...p,
              collectionIds: p.collectionIds.filter((id) => id !== collectionId),
              updatedAt: nowISO(),
            };
          }),
        }));

        PoemService.removePoemFromCollection(poemId, collectionId).catch((err) => {
          console.warn('PoemStore.removePoemFromCollection sync failed:', err);
        });
      },

      // ── Favorite toggle ───────────────────────────────────
      toggleFavorite: (poemId: string) => {
        const poem = get().poems.find((p) => p.id === poemId);
        const currentFav = poem?.isFavorite ?? false;

        set((state) => ({
          poems: state.poems.map((p) => {
            if (p.id !== poemId) return p;
            return { ...p, isFavorite: !p.isFavorite, updatedAt: nowISO() };
          }),
        }));

        PoemService.toggleFavorite(poemId, currentFav).catch((err) => {
          console.warn('PoemStore.toggleFavorite sync failed:', err);
        });
      },
    }),
    {
      name: STORAGE_KEYS.POEMS,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
      },
    }
  )
);
