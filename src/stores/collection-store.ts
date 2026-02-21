/**
 * Collection Store
 *
 * Zustand store for collection CRUD.
 * Local-first with Supabase sync: optimistic updates + background persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { Collection, AnthologyMeta, SectionDivider } from '@/types';
import { STORAGE_KEYS, DEFAULT_COLLECTION_IDS } from '@/utils/constants';
import { nowISO } from '@/utils';
import * as CollectionService from '@/services/collection-service';

// ─── Fallback Default Collections (used before server fetch) ─

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: DEFAULT_COLLECTION_IDS.ALL_POEMS,
    name: 'All Poems',
    description: 'Every poem you have written or imported.',
    coverColor: '#1A1A2E',
    iconName: 'book',
    isDefault: true,
    isAnthology: false,
    anthologyMeta: null,
    poemOrder: [],
    sectionDividers: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: DEFAULT_COLLECTION_IDS.DRAFTS,
    name: 'Drafts',
    description: 'Poems in progress.',
    coverColor: '#F59E0B',
    iconName: 'edit-3',
    isDefault: true,
    isAnthology: false,
    anthologyMeta: null,
    poemOrder: [],
    sectionDividers: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ─── Input Types ─────────────────────────────────────────────

interface CreateCollectionInput {
  name: string;
  description?: string;
  coverColor?: string;
  iconName?: string;
}

// ─── Store Interface ─────────────────────────────────────────

interface CollectionStore {
  collections: Collection[];
  isLoaded: boolean;
  isSyncing: boolean;
  syncError: string | null;

  // Sync
  fetchFromServer: (userId: string) => Promise<void>;

  // CRUD
  createCollection: (input: CreateCollectionInput, userId?: string) => Collection;
  updateCollection: (id: string, input: Partial<Pick<Collection, 'name' | 'description' | 'coverColor' | 'iconName'>>) => void;
  deleteCollection: (id: string) => boolean;
  getCollectionById: (id: string) => Collection | undefined;

  // Queries
  getUserCollections: () => Collection[];
  getAnthologies: () => Collection[];

  // Poem ordering
  setPoemOrder: (collectionId: string, poemIds: string[]) => void;

  // Anthology promotion
  promoteToAnthology: (collectionId: string, meta: AnthologyMeta) => void;
  updateAnthologyMeta: (collectionId: string, meta: Partial<AnthologyMeta>) => void;
  addSectionDivider: (collectionId: string, divider: SectionDivider) => void;
  removeSectionDivider: (collectionId: string, afterPoemId: string) => void;

  // Init
  ensureDefaults: () => void;
}

// ─── Store Implementation ────────────────────────────────────

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: DEFAULT_COLLECTIONS,
      isLoaded: false,
      isSyncing: false,
      syncError: null,

      // ── Fetch all collections from Supabase ───────────────
      fetchFromServer: async (_userId: string) => {
        set({ isSyncing: true, syncError: null });
        try {
          const collections = await CollectionService.fetchCollections();
          if (collections.length > 0) {
            set({ collections, isSyncing: false });
          } else {
            // Keep local defaults if server returns empty
            set({ isSyncing: false });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch collections';
          set({ isSyncing: false, syncError: msg });
          console.warn('CollectionStore.fetchFromServer:', msg);
        }
      },

      // ── Create ────────────────────────────────────────────
      createCollection: (input: CreateCollectionInput, userId?: string) => {
        const now = nowISO();
        const tempId = Crypto.randomUUID();
        const newCollection: Collection = {
          id: tempId,
          name: input.name,
          description: input.description ?? '',
          coverColor: input.coverColor ?? '#0F3460',
          iconName: input.iconName ?? 'folder',
          isDefault: false,
          isAnthology: false,
          anthologyMeta: null,
          poemOrder: [],
          sectionDividers: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          collections: [...state.collections, newCollection],
        }));

        // Background sync
        if (userId) {
          CollectionService.createCollection({
            userId,
            name: input.name,
            description: input.description,
            coverColor: input.coverColor,
            iconName: input.iconName,
          })
            .then((serverCollection) => {
              set((state) => ({
                collections: state.collections.map((c) =>
                  c.id === tempId ? serverCollection : c
                ),
              }));
            })
            .catch((err) => {
              console.warn('CollectionStore.createCollection sync failed:', err);
            });
        }

        return newCollection;
      },

      // ── Update ────────────────────────────────────────────
      updateCollection: (id, input) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== id) return c;
            return { ...c, ...input, updatedAt: nowISO() };
          }),
        }));

        CollectionService.updateCollection(id, {
          name: input.name,
          description: input.description,
          coverColor: input.coverColor,
          iconName: input.iconName,
        }).catch((err) => {
          console.warn('CollectionStore.updateCollection sync failed:', err);
        });
      },

      // ── Delete ────────────────────────────────────────────
      deleteCollection: (id: string) => {
        const collection = get().getCollectionById(id);
        if (!collection || collection.isDefault) return false;

        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }));

        CollectionService.deleteCollection(id).catch((err) => {
          console.warn('CollectionStore.deleteCollection sync failed:', err);
        });

        return true;
      },

      // ── Read ──────────────────────────────────────────────
      getCollectionById: (id: string) => {
        return get().collections.find((c) => c.id === id);
      },

      getUserCollections: () => {
        return get().collections.filter((c) => !c.isDefault && !c.isAnthology);
      },

      getAnthologies: () => {
        return get().collections.filter((c) => c.isAnthology);
      },

      // ── Poem ordering ─────────────────────────────────────
      setPoemOrder: (collectionId: string, poemIds: string[]) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            return { ...c, poemOrder: poemIds, updatedAt: nowISO() };
          }),
        }));

        CollectionService.setPoemOrder(collectionId, poemIds).catch((err) => {
          console.warn('CollectionStore.setPoemOrder sync failed:', err);
        });
      },

      // ── Anthology ─────────────────────────────────────────
      promoteToAnthology: (collectionId: string, meta: AnthologyMeta) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            return { ...c, isAnthology: true, anthologyMeta: meta, updatedAt: nowISO() };
          }),
        }));

        CollectionService.promoteToAnthology(collectionId, meta).catch((err) => {
          console.warn('CollectionStore.promoteToAnthology sync failed:', err);
        });
      },

      updateAnthologyMeta: (collectionId: string, meta: Partial<AnthologyMeta>) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId || !c.anthologyMeta) return c;
            return {
              ...c,
              anthologyMeta: { ...c.anthologyMeta, ...meta },
              updatedAt: nowISO(),
            };
          }),
        }));

        CollectionService.updateAnthologyMeta(collectionId, meta).catch((err) => {
          console.warn('CollectionStore.updateAnthologyMeta sync failed:', err);
        });
      },

      addSectionDivider: (collectionId: string, divider: SectionDivider) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            const filtered = c.sectionDividers.filter(
              (d) => d.afterPoemId !== divider.afterPoemId
            );
            return {
              ...c,
              sectionDividers: [...filtered, divider],
              updatedAt: nowISO(),
            };
          }),
        }));

        CollectionService.upsertSectionDivider(collectionId, divider).catch((err) => {
          console.warn('CollectionStore.addSectionDivider sync failed:', err);
        });
      },

      removeSectionDivider: (collectionId: string, afterPoemId: string) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            return {
              ...c,
              sectionDividers: c.sectionDividers.filter(
                (d) => d.afterPoemId !== afterPoemId
              ),
              updatedAt: nowISO(),
            };
          }),
        }));

        CollectionService.removeSectionDivider(collectionId, afterPoemId).catch((err) => {
          console.warn('CollectionStore.removeSectionDivider sync failed:', err);
        });
      },

      // ── Ensure defaults ───────────────────────────────────
      ensureDefaults: () => {
        const current = get().collections;
        const hasAllPoems = current.some((c) => c.id === DEFAULT_COLLECTION_IDS.ALL_POEMS);
        const hasDrafts = current.some((c) => c.id === DEFAULT_COLLECTION_IDS.DRAFTS);

        if (!hasAllPoems || !hasDrafts) {
          const missing = DEFAULT_COLLECTIONS.filter(
            (dc) => !current.some((c) => c.id === dc.id)
          );
          set({ collections: [...current, ...missing] });
        }
      },
    }),
    {
      name: STORAGE_KEYS.COLLECTIONS,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
          state.ensureDefaults();
        }
      },
    }
  )
);
