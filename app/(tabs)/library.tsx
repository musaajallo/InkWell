/**
 * Library Screen
 *
 * Collections, anthologies & saved poems.
 * Features: search bar, filter toggle, default collections pinned at top,
 * anthologies section, user collections, and FAB for new collection/import.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { usePoemStore } from '../../src/stores/poem-store';
import { useCollectionStore } from '../../src/stores/collection-store';
import { useAuthStore } from '../../src/stores/auth-store';
import CollectionCard from '../../src/components/collection-card';
import SearchBar from '../../src/components/search-bar';
import FilterToggle from '../../src/components/filter-toggle';
import Fab from '../../src/components/fab';
import EmptyState from '../../src/components/empty-state';
import { DEFAULT_COLLECTION_IDS } from '../../src/utils/constants';

type PoemFilter = 'All' | 'My Poems' | 'Imported';

const FILTER_OPTIONS: PoemFilter[] = ['All', 'My Poems', 'Imported'];

export default function LibraryScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  // ─── State ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PoemFilter>('All');
  const [refreshing, setRefreshing] = useState(false);

  // ─── Store Data ──────────────────────────────────────────────
  const poems = usePoemStore((s) => s.poems);
  const searchPoems = usePoemStore((s) => s.searchPoems);
  const getPoemsByCollection = usePoemStore((s) => s.getPoemsByCollection);

  const collections = useCollectionStore((s) => s.collections);
  const createCollection = useCollectionStore((s) => s.createCollection);
  const userId = useAuthStore((s) => s.user?.id);

  // ─── Derived Data ────────────────────────────────────────────

  // Default collections (always pinned at top)
  const defaultCollections = useMemo(
    () => collections.filter((c) => c.isDefault),
    [collections]
  );

  // Anthologies
  const anthologies = useMemo(
    () => collections.filter((c) => c.isAnthology),
    [collections]
  );

  // User collections (non-default, non-anthology)
  const userCollections = useMemo(
    () => collections.filter((c) => !c.isDefault && !c.isAnthology),
    [collections]
  );

  // Filtered poem counts based on the active filter
  const getFilteredPoemCount = useCallback(
    (collectionId: string): number => {
      const collectionPoems = getPoemsByCollection(collectionId);

      if (filter === 'All') return collectionPoems.length;
      if (filter === 'My Poems') {
        return collectionPoems.filter((p) => p.source.type === 'original' || p.source.type === 'dictated').length;
      }
      // Imported
      return collectionPoems.filter((p) => p.source.type === 'imported' || p.source.type === 'poetrydb').length;
    },
    [getPoemsByCollection, filter]
  );

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length === 0) return null;
    const results = searchPoems(searchQuery);

    if (filter === 'My Poems') {
      return results.filter((p) => p.source.type === 'original' || p.source.type === 'dictated');
    }
    if (filter === 'Imported') {
      return results.filter((p) => p.source.type === 'imported' || p.source.type === 'poetrydb');
    }
    return results;
  }, [searchQuery, searchPoems, filter]);

  // Total poem count for header
  const totalPoemCount = useMemo(() => {
    if (filter === 'My Poems') {
      return poems.filter((p) => p.source.type === 'original' || p.source.type === 'dictated').length;
    }
    if (filter === 'Imported') {
      return poems.filter((p) => p.source.type === 'imported' || p.source.type === 'poetrydb').length;
    }
    return poems.length;
  }, [poems, filter]);

  // ─── Handlers ────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Small delay to show refresh indicator
    await new Promise((resolve) => setTimeout(resolve, 300));
    setRefreshing(false);
  }, []);

  const handleCollectionPress = useCallback(
    (collectionId: string) => {
      router.push(`/collection/${collectionId}`);
    },
    [router]
  );

  const handleNewCollection = useCallback(() => {
    Alert.prompt(
      'New Collection',
      'Enter a name for your collection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name?: string) => {
            if (name && name.trim().length > 0) {
              createCollection({ name: name.trim() }, userId);
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }, [createCollection, userId]);

  const handleImportPoem = useCallback(() => {
    router.push('/import');
  }, [router]);

  const fabActions = useMemo(
    () => [
      {
        label: 'New Collection',
        iconName: 'folder-plus' as const,
        onPress: handleNewCollection,
      },
      {
        label: 'Import Poem',
        iconName: 'download' as const,
        onPress: handleImportPoem,
      },
    ],
    [handleNewCollection, handleImportPoem]
  );

  // ─── Render Helpers ──────────────────────────────────────────

  const renderSearchResults = () => {
    if (!searchResults) return null;

    if (searchResults.length === 0) {
      return (
        <EmptyState
          iconName="search"
          title="No poems found"
          subtitle={`No results for "${searchQuery}"`}
        />
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
        </Text>
        {searchResults.map((poem) => (
          <View
            key={poem.id}
            style={[styles.searchResultItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.searchResultTitle, { color: colors.text }]} numberOfLines={1}>
              {poem.title || 'Untitled'}
            </Text>
            <Text style={[styles.searchResultPreview, { color: colors.textSecondary }]} numberOfLines={2}>
              {poem.body || 'No content yet'}
            </Text>
            <View style={styles.searchResultMeta}>
              <Text style={[styles.searchResultMetaText, { color: colors.textSecondary }]}>
                {poem.wordCount} words
              </Text>
              {poem.source.type !== 'original' && (
                <View style={[styles.importedBadge, { backgroundColor: colors.imported + '15' }]}>
                  <Text style={[styles.importedBadgeText, { color: colors.imported }]}>
                    Imported
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderCollections = () => (
    <>
      {/* Default Collections (pinned) */}
      <View style={styles.section}>
        {defaultCollections.map((collection) => (
          <CollectionCard
            key={collection.id}
            name={collection.name}
            description={collection.description}
            coverColor={collection.coverColor}
            iconName={collection.iconName}
            poemCount={getFilteredPoemCount(collection.id)}
            onPress={() => handleCollectionPress(collection.id)}
          />
        ))}
      </View>

      {/* Anthologies Section */}
      {anthologies.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Anthologies
          </Text>
          {anthologies.map((collection) => (
            <CollectionCard
              key={collection.id}
              name={collection.name}
              description={collection.description}
              coverColor={collection.coverColor}
              iconName={collection.iconName}
              poemCount={getFilteredPoemCount(collection.id)}
              isAnthology
              onPress={() => handleCollectionPress(collection.id)}
            />
          ))}
        </View>
      )}

      {/* User Collections */}
      {userCollections.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Collections
          </Text>
          {userCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              name={collection.name}
              description={collection.description}
              coverColor={collection.coverColor}
              iconName={collection.iconName}
              poemCount={getFilteredPoemCount(collection.id)}
              onPress={() => handleCollectionPress(collection.id)}
            />
          ))}
        </View>
      )}

      {/* Empty state when no user collections exist */}
      {userCollections.length === 0 && anthologies.length === 0 && (
        <EmptyState
          iconName="folder"
          title="No collections yet"
          subtitle="Create a collection to organize your poems"
          actionLabel="Create Collection"
          onAction={handleNewCollection}
        />
      )}
    </>
  );

  // ─── Main Render ─────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Library</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {totalPoemCount} {totalPoemCount === 1 ? 'poem' : 'poems'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search poems, titles, tags..."
          />
        </View>

        {/* Filter Toggle */}
        <View style={styles.filterContainer}>
          <FilterToggle
            options={FILTER_OPTIONS}
            activeOption={filter}
            onSelect={(option) => setFilter(option as PoemFilter)}
          />
        </View>

        {/* Content: either search results or collections */}
        {searchResults ? renderSearchResults() : renderCollections()}

        {/* Bottom padding for FAB */}
        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <Fab actions={fabActions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  filterContainer: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  // Search result items
  searchResultItem: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchResultTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  searchResultPreview: {
    fontSize: FontSize.md,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchResultMetaText: {
    fontSize: FontSize.xs,
  },
  importedBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  importedBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  fabSpacer: {
    height: 80,
  },
});
