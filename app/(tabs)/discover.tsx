/**
 * Discover Screen
 *
 * Inspiration hub: today's writing prompt, poetry forms reference,
 * browse prompts by category, and import quick action.
 * Data fetched from Supabase via custom hooks.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useWritingPrompts } from '../../src/hooks/use-writing-prompts';
import { usePoetryForms } from '../../src/hooks/use-poetry-forms';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import WritingPromptCard from '../../src/components/writing-prompt-card';
import PoetryFormCard from '../../src/components/poetry-form-card';
import CategoryCard from '../../src/components/category-card';
import ImportQuickAction from '../../src/components/import-quick-action';
import type { PromptCategory, PoetryFormSlug, PoetryForm } from '../../src/types';

// ─── Static category metadata ────────────────────────────────

interface CategoryInfo {
  name: PromptCategory;
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  color: string;
}

const CATEGORY_META: CategoryInfo[] = [
  { name: 'emotion', label: 'Emotion', iconName: 'heart', color: '#E94560' },
  { name: 'nature', label: 'Nature', iconName: 'sun', color: '#10B981' },
  { name: 'memory', label: 'Memory', iconName: 'clock', color: '#F59E0B' },
  { name: 'abstract', label: 'Abstract', iconName: 'wind', color: '#8B5CF6' },
  { name: 'story', label: 'Story', iconName: 'book', color: '#0F3460' },
  { name: 'observation', label: 'Observation', iconName: 'eye', color: '#6366F1' },
];

export default function DiscoverScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  // ─── Data Hooks ─────────────────────────────────────────────
  const {
    prompts,
    currentPrompt,
    loading: promptLoading,
    shuffle,
  } = useWritingPrompts();
  const { forms, loading: formsLoading, refresh: refreshForms } = usePoetryForms();

  // ─── Derived: category counts from loaded prompts ──────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of prompts) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [prompts]);

  // ─── State ─────────────────────────────────────────────────
  const [refreshing, setRefreshing] = React.useState(false);

  // ─── Handlers ──────────────────────────────────────────────
  const handleShuffle = useCallback(() => {
    shuffle();
  }, [shuffle]);

  const handleFormPress = useCallback(
    (slug: PoetryFormSlug) => {
      router.push(`/forms/${slug}`);
    },
    [router]
  );

  const handleCategoryPress = useCallback(
    (category: PromptCategory) => {
      // TODO: Navigate to filtered prompts by category
      console.log('Browse category:', category);
    },
    []
  );

  const handleImportPress = useCallback(() => {
    router.push('/import');
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([shuffle(), refreshForms()]);
    setRefreshing(false);
  }, [shuffle, refreshForms]);

  // ─── Render ────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Discover</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find inspiration for your next poem
        </Text>
      </View>

      {/* Section 1: Today's Writing Prompt */}
      <View style={styles.section}>
        {currentPrompt ? (
          <WritingPromptCard
            prompt={currentPrompt.text}
            category={currentPrompt.category}
            onShuffle={handleShuffle}
          />
        ) : promptLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.secondary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading prompt...
            </Text>
          </View>
        ) : null}
      </View>

      {/* Section 2: Poetry Forms (horizontal scroll) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Poetry Forms
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
            {forms.length} forms
          </Text>
        </View>
        {formsLoading && forms.length === 0 ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.secondary} />
          </View>
        ) : (
          <FlatList<PoetryForm>
            data={forms}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.slug}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <PoetryFormCard
                name={item.name}
                origin={item.origin.split('.')[0]}
                description={item.description}
                lineCount={item.lineCount}
                onPress={() => handleFormPress(item.slug)}
              />
            )}
          />
        )}
      </View>

      {/* Section 3: Browse by Category */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Browse by Category
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_META.map((cat) => (
            <CategoryCard
              key={cat.name}
              name={cat.label}
              iconName={cat.iconName}
              color={cat.color}
              promptCount={categoryCounts[cat.name] ?? 0}
              onPress={() => handleCategoryPress(cat.name)}
            />
          ))}
        </View>
      </View>

      {/* Section 4: Import Quick Action */}
      <View style={styles.section}>
        <ImportQuickAction onPress={handleImportPress} />
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
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
    marginBottom: Spacing.lg,
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionCount: {
    fontSize: FontSize.sm,
  },
  horizontalList: {
    paddingRight: Spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
