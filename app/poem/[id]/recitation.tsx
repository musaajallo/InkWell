/**
 * Poem Recitation Screen
 *
 * Generates and plays AI audio recitation of a poem.
 * Requires an ElevenLabs API key configured in Settings.
 * Falls back to device TTS via expo-speech if no key.
 */

import React, { useState, useCallback, useRef } from 'react';
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
import * as Speech from 'expo-speech';
import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useApiKeys } from '../../../src/hooks/use-api-keys';
import { usePoemStore } from '../../../src/stores/poem-store';
import { useSettingsStore } from '../../../src/stores/settings-store';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';
import type { RecitationPace } from '../../../src/types';

type PlaybackState = 'idle' | 'generating' | 'playing' | 'paused';

const PACE_LABELS: Record<RecitationPace, string> = {
  slow: 'Slow & Contemplative',
  normal: 'Natural',
  dramatic: 'Dramatic',
};

const PACE_RATES: Record<RecitationPace, number> = {
  slow: 0.7,
  normal: 1.0,
  dramatic: 0.85,
};

export default function RecitationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { hasElevenLabsKey } = useApiKeys();

  const poem = usePoemStore((s) => s.poems.find((p) => p.id === id));
  const recitationPace = useSettingsStore((s) => s.settings.recitationPace);
  const ttsRate = useSettingsStore((s) => s.settings.ttsRate);

  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [selectedPace, setSelectedPace] = useState<RecitationPace>(recitationPace);
  const isSpeakingRef = useRef(false);

  const handleBack = useCallback(() => {
    Speech.stop();
    if (router.canGoBack()) router.back();
  }, [router]);

  // Device TTS fallback
  const handlePlayTTS = useCallback(() => {
    if (!poem?.body.trim()) {
      Alert.alert('Empty Poem', 'Write some content before generating a recitation.');
      return;
    }

    if (isSpeakingRef.current) {
      Speech.stop();
      isSpeakingRef.current = false;
      setPlaybackState('idle');
      return;
    }

    const rate = PACE_RATES[selectedPace] * ttsRate;
    isSpeakingRef.current = true;
    setPlaybackState('playing');

    Speech.speak(poem.body, {
      rate,
      pitch: 1.0,
      onDone: () => {
        isSpeakingRef.current = false;
        setPlaybackState('idle');
      },
      onStopped: () => {
        isSpeakingRef.current = false;
        setPlaybackState('idle');
      },
      onError: () => {
        isSpeakingRef.current = false;
        setPlaybackState('idle');
      },
    });
  }, [poem, selectedPace, ttsRate]);

  const handleGenerateAI = useCallback(() => {
    if (!hasElevenLabsKey) {
      Alert.alert(
        'API Key Required',
        'Add your ElevenLabs API key in Settings to generate AI recitations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.push('/(tabs)/settings') },
        ]
      );
      return;
    }

    // TODO: Implement ElevenLabs API call via services/elevenlabs-api.ts
    Alert.alert('Coming Soon', 'AI voice recitation will be available in a future update.');
  }, [hasElevenLabsKey, router]);

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

  // ─── Render ────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recitation</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Poem Info */}
        <Text style={[styles.poemTitle, { color: colors.text }]}>
          {poem.title || 'Untitled'}
        </Text>
        <Text style={[styles.poemStats, { color: colors.textSecondary }]}>
          {poem.lineCount} lines · {poem.wordCount} words
        </Text>

        {/* Pace Selector */}
        <View style={styles.paceSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading Pace</Text>
          <View style={styles.paceOptions}>
            {(Object.keys(PACE_LABELS) as RecitationPace[]).map((pace) => {
              const isActive = pace === selectedPace;
              return (
                <TouchableOpacity
                  key={pace}
                  style={[
                    styles.paceOption,
                    { borderColor: isActive ? colors.secondary : colors.border },
                    isActive && { backgroundColor: colors.secondary + '12' },
                  ]}
                  onPress={() => setSelectedPace(pace)}
                >
                  <Text
                    style={[
                      styles.paceLabel,
                      { color: isActive ? colors.secondary : colors.text },
                      isActive && { fontWeight: '700' },
                    ]}
                  >
                    {PACE_LABELS[pace]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Device TTS */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="volume-2" size={20} color={colors.text} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Device Voice</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Use your device's built-in text-to-speech engine. Free, instant, no API key needed.
          </Text>
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: playbackState === 'playing' ? colors.error : colors.primary }]}
            onPress={handlePlayTTS}
            activeOpacity={0.7}
          >
            <Feather
              name={playbackState === 'playing' ? 'square' : 'play'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.playBtnText}>
              {playbackState === 'playing' ? 'Stop' : 'Play'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Voice */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="mic" size={20} color={colors.secondary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>AI Voice</Text>
            {!hasElevenLabsKey && (
              <View style={[styles.badge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.warning }]}>Key Required</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Generate a natural-sounding recitation using ElevenLabs AI voices. Requires an API key.
          </Text>
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: colors.secondary }]}
            onPress={handleGenerateAI}
            activeOpacity={0.7}
          >
            <Feather name="cpu" size={18} color="#FFFFFF" />
            <Text style={styles.playBtnText}>Generate AI Recitation</Text>
          </TouchableOpacity>
        </View>

        {/* Poem Preview */}
        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Poem Text</Text>
          <View style={[styles.previewBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.previewText, { color: colors.text }]}>
              {poem.body || 'No content'}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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

  poemTitle: { fontSize: FontSize.xxl, fontWeight: '700', fontFamily: 'serif' },
  poemStats: { fontSize: FontSize.sm, marginTop: Spacing.xs, marginBottom: Spacing.lg },

  // Pace
  paceSection: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },
  paceOptions: { gap: Spacing.sm },
  paceOption: {
    paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1.5,
  },
  paceLabel: { fontSize: FontSize.md },

  // Cards
  card: {
    borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  cardDesc: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, marginBottom: Spacing.md },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md,
  },
  playBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700' },

  // Preview
  previewSection: { marginTop: Spacing.sm },
  previewBox: {
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  previewText: { fontSize: FontSize.md, fontFamily: 'serif', lineHeight: FontSize.md * 1.75 },

  bottomSpacer: { height: Spacing.xxl },
});
