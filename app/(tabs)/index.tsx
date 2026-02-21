import React, { useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useDailyPoem } from '../../src/hooks/use-daily-poem';
import { useWritingPrompts } from '../../src/hooks/use-writing-prompts';
import { usePoemStore } from '../../src/stores/poem-store';
import { Spacing, FontSize } from '../../src/constants/theme';
import DailyPoemCard from '../../src/components/daily-poem-card';
import StartWritingButton from '../../src/components/start-writing-button';
import RecentDraftsSection from '../../src/components/recent-drafts-section';
import WritingPromptCard from '../../src/components/writing-prompt-card';
import { formatRelativeDate } from '../../src/utils/date';
import { generatePreview } from '../../src/utils/text-formatter';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  // ─── Data hooks ─────────────────────────────────────────────
  const { poem: dailyPoem, loading: dailyLoading, refresh: refreshDaily } = useDailyPoem();
  const { currentPrompt, loading: promptLoading, shuffle } = useWritingPrompts();

  // ─── Recent drafts from poem store ─────────────────────────
  const poems = usePoemStore((s) => s.poems);

  const recentDrafts = useMemo(() => {
    return [...poems]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        preview: generatePreview(p.body, 80),
        updatedAt: formatRelativeDate(p.updatedAt),
        status: p.status as 'draft' | 'complete',
      }));
  }, [poems]);

  // ─── Handlers ──────────────────────────────────────────────
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshDaily(), shuffle()]);
    setRefreshing(false);
  }, [refreshDaily, shuffle]);

  const handleTTSPress = () => {
    // TODO: Integrate expo-speech to read daily poem aloud
  };

  const handleSavePress = () => {
    // TODO: Save daily poem to a collection
  };

  const handleDraftPress = (id: string) => {
    router.push(`/poem/${id}`);
  };

  const handleShuffle = () => {
    shuffle();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={[styles.greetingText, { color: colors.text }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {formatDateDisplay()}
        </Text>
      </View>

      {/* Daily Poem */}
      {dailyLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.secondary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading today's poem...
          </Text>
        </View>
      ) : dailyPoem ? (
        <DailyPoemCard
          title={dailyPoem.title}
          author={dailyPoem.author}
          lines={dailyPoem.lines}
          onTTSPress={handleTTSPress}
          onSavePress={handleSavePress}
        />
      ) : null}

      {/* Start Writing CTA */}
      <StartWritingButton />

      {/* Recent Drafts */}
      <RecentDraftsSection
        drafts={recentDrafts}
        onDraftPress={handleDraftPress}
      />

      {/* Today's Writing Prompt */}
      {currentPrompt ? (
        <WritingPromptCard
          prompt={currentPrompt.text}
          category={currentPrompt.category}
          onShuffle={handleShuffle}
        />
      ) : promptLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.secondary} />
        </View>
      ) : null}
    </ScrollView>
  );
}

// -- Helpers --

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDateDisplay(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  greeting: {
    marginBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  dateText: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
  },
});
