/**
 * AI Poem Review Screen
 *
 * Generates and displays an AI-powered review of a poem.
 * Requires an Anthropic (Claude) API key configured in Settings.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useApiKeys } from '../../../src/hooks/use-api-keys';
import { usePoemStore } from '../../../src/stores/poem-store';
import { useSettingsStore } from '../../../src/stores/settings-store';
import { useAuthStore } from '../../../src/stores/auth-store';
import { generatePoemReview } from '../../../src/services/anthropic-api';
import { createReview as createReviewOnServer } from '../../../src/services/review-service';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';
import type { PoemReview, ReviewTone } from '../../../src/types';

type ReviewStatus = 'idle' | 'loading' | 'done' | 'error';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { keys, hasAnthropicKey } = useApiKeys();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const poem = usePoemStore((s) => s.poems.find((p) => p.id === id));
  const updatePoem = usePoemStore((s) => s.updatePoem);
  const reviewTone = useSettingsStore((s) => s.settings.reviewTone);

  const [status, setStatus] = useState<ReviewStatus>(
    poem?.review ? 'done' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);

  const existingReview = poem?.review ?? null;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const handleGenerateReview = useCallback(async () => {
    if (!poem) return;

    if (!hasAnthropicKey) {
      Alert.alert(
        'API Key Required',
        'Add your Anthropic API key in Settings to generate AI reviews.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.push('/(tabs)/settings') },
        ]
      );
      return;
    }

    if (!poem.body.trim()) {
      Alert.alert('Empty Poem', 'Write some content before requesting a review.');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const review = await generatePoemReview(
        keys.anthropic!,
        {
          title: poem.title,
          body: poem.body,
          formType: poem.formType,
          tone: reviewTone,
        },
        poem.id
      );

      // Save review on the poem locally
      updatePoem(poem.id, { review });

      // Persist to Supabase in the background
      if (userId) {
        createReviewOnServer({
          userId,
          poemId: poem.id,
          summary: review.summary,
          themes: review.themes,
          literaryDevices: review.literaryDevices,
          structureAnalysis: review.structureAnalysis,
          interpretation: review.interpretation,
          tone: review.tone,
          poemBodyHash: review.poemBodyHash,
          personalNotes: review.personalNotes,
        }).catch(() => {
          // Background sync failure — review is still saved locally
        });
      }

      setStatus('done');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate review. Please try again.';
      setError(message);
      setStatus('error');
    }
  }, [poem, hasAnthropicKey, keys.anthropic, reviewTone, updatePoem, userId, router]);

  // ─── Not Found ─────────────────────────────────────────────

  if (!poem) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={48} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Poem not found</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleBack}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const review = poem.review ?? existingReview;

  // ─── Render ────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Review</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Poem Title */}
        <Text style={[styles.poemTitle, { color: colors.text }]}>
          {poem.title || 'Untitled'}
        </Text>

        {/* Status: Idle */}
        {status === 'idle' && (
          <View style={styles.idleContainer}>
            <Feather name="zap" size={40} color={colors.secondary} />
            <Text style={[styles.idleText, { color: colors.textSecondary }]}>
              Get an AI-powered analysis of your poem including themes, literary devices, and interpretation.
            </Text>
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: colors.secondary }]}
              onPress={handleGenerateReview}
              activeOpacity={0.7}
            >
              <Feather name="cpu" size={18} color="#FFFFFF" />
              <Text style={styles.generateBtnText}>Generate Review</Text>
            </TouchableOpacity>
            {!hasAnthropicKey && (
              <Text style={[styles.apiWarning, { color: colors.warning }]}>
                Anthropic API key required — add it in Settings
              </Text>
            )}
          </View>
        )}

        {/* Status: Loading */}
        {status === 'loading' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Analyzing your poem...
            </Text>
          </View>
        )}

        {/* Status: Error */}
        {status === 'error' && (
          <View style={styles.idleContainer}>
            <Feather name="alert-triangle" size={40} color={colors.error} />
            <Text style={[styles.idleText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: colors.secondary }]}
              onPress={handleGenerateReview}
            >
              <Feather name="refresh-cw" size={18} color="#FFFFFF" />
              <Text style={styles.generateBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status: Done — Show Review */}
        {status === 'done' && review && (
          <View style={styles.reviewContent}>
            {/* Summary */}
            <ReviewSection title="Summary" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.text }]}>{review.summary}</Text>
            </ReviewSection>

            {/* Themes */}
            <ReviewSection title="Themes" colors={colors}>
              {review.themes.map((theme, i) => (
                <View key={i} style={[styles.themeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.themeName, { color: colors.secondary }]}>{theme.name}</Text>
                  <Text style={[styles.bodyText, { color: colors.text }]}>{theme.explanation}</Text>
                </View>
              ))}
            </ReviewSection>

            {/* Literary Devices */}
            <ReviewSection title="Literary Devices" colors={colors}>
              {review.literaryDevices.map((device, i) => (
                <View key={i} style={[styles.deviceRow, { borderColor: colors.border }]}>
                  <Text style={[styles.deviceName, { color: colors.text }]}>{device.device}</Text>
                  <Text style={[styles.deviceExample, { color: colors.textSecondary }]}>"{device.example}"</Text>
                  <Text style={[styles.bodyText, { color: colors.text }]}>{device.explanation}</Text>
                </View>
              ))}
            </ReviewSection>

            {/* Structure */}
            <ReviewSection title="Structure Analysis" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.text }]}>{review.structureAnalysis}</Text>
            </ReviewSection>

            {/* Interpretation */}
            <ReviewSection title="Interpretation" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.text }]}>{review.interpretation}</Text>
            </ReviewSection>

            {/* Regenerate */}
            <TouchableOpacity
              style={[styles.regenBtn, { borderColor: colors.border }]}
              onPress={handleGenerateReview}
            >
              <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
              <Text style={[styles.regenText, { color: colors.textSecondary }]}>Regenerate Review</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────

interface ReviewSectionProps {
  title: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  children: React.ReactNode;
}

function ReviewSection({ title, colors, children }: ReviewSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', marginTop: Spacing.md },
  btn: { marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md },
  btnText: { color: '#FFFFFF', fontWeight: '600', fontSize: FontSize.md },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl + Spacing.sm, paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  poemTitle: { fontSize: FontSize.xxl, fontWeight: '700', fontFamily: 'serif', marginBottom: Spacing.lg },

  // Idle
  idleContainer: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  idleText: { fontSize: FontSize.md, textAlign: 'center', lineHeight: FontSize.md * 1.6, paddingHorizontal: Spacing.md },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg,
  },
  generateBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700' },
  apiWarning: { fontSize: FontSize.sm, fontStyle: 'italic' },

  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: Spacing.xxl * 2, gap: Spacing.md },
  loadingText: { fontSize: FontSize.md },

  // Review content
  reviewContent: { gap: 0 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },
  bodyText: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.6 },

  // Themes
  themeCard: {
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  themeName: { fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.xs },

  // Devices
  deviceRow: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: Spacing.sm, marginBottom: Spacing.sm },
  deviceName: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 2 },
  deviceExample: { fontSize: FontSize.sm, fontStyle: 'italic', marginBottom: Spacing.xs },

  // Regenerate
  regenBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  regenText: { fontSize: FontSize.sm, fontWeight: '600' },

  bottomSpacer: { height: Spacing.xxl },
});
