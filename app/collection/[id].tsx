/**
 * Collection Detail Screen
 *
 * Displays all poems in a collection with search, sort, and management options.
 */

import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePoemStore } from '../../src/stores/poem-store';
import { useCollectionStore } from '../../src/stores/collection-store';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import PoemCard from '../../src/components/poem-card';
import SearchBar from '../../src/components/search-bar';
import EmptyState from '../../src/components/empty-state';
import type { Poem } from '../../src/types';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();

  const collection = useCollectionStore((s) =>
    s.collections.find((c) => c.id === id)
  );
  const poems = usePoemStore((s) => s.getPoemsByCollection(id));
  const toggleFavorite = usePoemStore((s) => s.toggleFavorite);

  const [search, setSearch] = useState('');

  // ─── Filtered poems ────────────────────────────────────────

  const filteredPoems = useMemo(() => {
    if (!search.trim()) return poems;
    const q = search.toLowerCase();
    return poems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [poems, search]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const handlePoemPress = useCallback(
    (poemId: string) => {
      router.push(`/poem/${poemId}`);
    },
    [router]
  );

  const handleToggleFavorite = useCallback(
    (poemId: string) => {
      toggleFavorite(poemId);
    },
    [toggleFavorite]
  );

  const renderItem = useCallback(
    ({ item }: { item: Poem }) => (
      <PoemCard
        poem={item}
        onPress={handlePoemPress}
        onToggleFavorite={handleToggleFavorite}
        showSource
      />
    ),
    [handlePoemPress, handleToggleFavorite]
  );

  const keyExtractor = useCallback((item: Poem) => item.id, []);

  // ─── Not Found ─────────────────────────────────────────────

  if (!collection) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="folder" size={48} color={colors.border} />
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>
          Collection not found
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={handleBack}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.colorDot, { backgroundColor: collection.coverColor }]} />
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {collection.name}
            </Text>
            {collection.isAnthology && (
              <Feather name="book" size={14} color={colors.secondary} />
            )}
          </View>
          <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
            {poems.length} poem{poems.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Description */}
      {collection.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {collection.description}
        </Text>
      ) : null}

      {/* Search */}
      {poems.length > 3 && (
        <View style={styles.searchWrap}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search in collection..."
          />
        </View>
      )}

      {/* Poem List */}
      <FlatList
        data={filteredPoems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            iconName="file-text"
            title={search ? 'No matches' : 'No poems yet'}
            subtitle={
              search
                ? 'Try a different search term'
                : 'Add poems to this collection from the editor'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  notFoundTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  backBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FontSize.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    maxWidth: 200,
  },
  headerCount: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  description: {
    fontSize: FontSize.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    lineHeight: 18,
  },
  searchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
});
