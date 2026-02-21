/**
 * Settings Screen
 *
 * App preferences: theme, editor, voice, TTS, AI API keys,
 * recitation/review defaults, sharing, about, and reset.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useApiKeys } from '../../src/hooks/use-api-keys';
import { useSettingsStore } from '../../src/stores/settings-store';
import { useAuthStore } from '../../src/stores/auth-store';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { TTS_DEFAULTS } from '../../src/utils/constants';
import SettingRow from '../../src/components/setting-row';
import SegmentedControl from '../../src/components/segmented-control';
import ApiKeyInput from '../../src/components/api-key-input';
import type { AppSettings, RecitationPace, ReviewTone } from '../../src/types';

// ─── Constants ──────────────────────────────────────────────

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
const THEME_LABELS = ['Light', 'Dark', 'System'] as const;

const FONT_FAMILY_OPTIONS = ['serif', 'monospace'] as const;
const FONT_FAMILY_LABELS = ['Serif', 'Mono'] as const;

const FONT_SIZE_OPTIONS = ['small', 'medium', 'large'] as const;
const FONT_SIZE_LABELS = ['Small', 'Medium', 'Large'] as const;

const PACE_OPTIONS = ['slow', 'normal', 'dramatic'] as const;
const PACE_LABELS = ['Slow', 'Normal', 'Dramatic'] as const;

const TONE_OPTIONS = ['academic', 'casual', 'encouraging'] as const;
const TONE_LABELS = ['Academic', 'Casual', 'Encouraging'] as const;

const APP_VERSION = '1.0.0';

// ─── Component ──────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, isDark } = useAppTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const setThemeStore = useSettingsStore((s) => s.setTheme);
  const setEditorFontFamilyStore = useSettingsStore((s) => s.setEditorFontFamily);
  const setEditorFontSizeStore = useSettingsStore((s) => s.setEditorFontSize);
  const setTtsRateStore = useSettingsStore((s) => s.setTtsRate);
  const setRecitationPaceStore = useSettingsStore((s) => s.setRecitationPace);
  const setReviewToneStore = useSettingsStore((s) => s.setReviewTone);
  const toggleSyllableCounterStore = useSettingsStore((s) => s.toggleSyllableCounter);
  const toggleLineNumbersStore = useSettingsStore((s) => s.toggleLineNumbers);
  const toggleShareWatermarkStore = useSettingsStore((s) => s.toggleShareWatermark);
  const resetToDefaultsStore = useSettingsStore((s) => s.resetToDefaults);
  const userId = useAuthStore((s) => s.user?.id);

  // Wrappers that pass userId for Supabase sync
  const setTheme = useCallback(
    (theme: AppSettings['theme']) => setThemeStore(theme, userId),
    [setThemeStore, userId]
  );
  const setEditorFontFamily = useCallback(
    (family: AppSettings['editorFontFamily']) => setEditorFontFamilyStore(family, userId),
    [setEditorFontFamilyStore, userId]
  );
  const setEditorFontSize = useCallback(
    (size: AppSettings['editorFontSize']) => setEditorFontSizeStore(size, userId),
    [setEditorFontSizeStore, userId]
  );
  const setTtsRate = useCallback(
    (rate: number) => setTtsRateStore(rate, userId),
    [setTtsRateStore, userId]
  );
  const setRecitationPace = useCallback(
    (pace: RecitationPace) => setRecitationPaceStore(pace, userId),
    [setRecitationPaceStore, userId]
  );
  const setReviewTone = useCallback(
    (tone: ReviewTone) => setReviewToneStore(tone, userId),
    [setReviewToneStore, userId]
  );
  const toggleSyllableCounter = useCallback(
    () => toggleSyllableCounterStore(userId),
    [toggleSyllableCounterStore, userId]
  );
  const toggleLineNumbers = useCallback(
    () => toggleLineNumbersStore(userId),
    [toggleLineNumbersStore, userId]
  );
  const toggleShareWatermark = useCallback(
    () => toggleShareWatermarkStore(userId),
    [toggleShareWatermarkStore, userId]
  );
  const resetToDefaults = useCallback(
    () => resetToDefaultsStore(userId),
    [resetToDefaultsStore, userId]
  );

  const {
    keys,
    setAnthropicKey,
    setElevenLabsKey,
    clearAnthropicKey,
    clearElevenLabsKey,
  } = useApiKeys();

  // ─── TTS Rate Display ──────────────────────────────────────

  const ttsRateLabel = `${settings.ttsRate.toFixed(1)}x`;

  const adjustTtsRate = useCallback(
    (delta: number) => {
      const newRate = Math.round((settings.ttsRate + delta) * 10) / 10;
      if (newRate >= TTS_DEFAULTS.MIN_RATE && newRate <= TTS_DEFAULTS.MAX_RATE) {
        setTtsRate(newRate);
      }
    },
    [settings.ttsRate, setTtsRate]
  );

  // ─── Reset Confirmation ────────────────────────────────────

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset to Defaults',
      'This will reset all settings to their default values. API keys will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetToDefaults,
        },
      ]
    );
  }, [resetToDefaults]);

  // ─── Render ────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      {/* ── Appearance ───────────────────────────────────── */}
      <SectionHeader label="Appearance" icon="sun" colors={colors} />

      <SettingRow
        type="custom"
        label="Theme"
        icon="moon"
        description="Choose how InkWell looks"
      >
        <SegmentedControl
          options={THEME_OPTIONS}
          labels={THEME_LABELS}
          value={settings.theme}
          onValueChange={setTheme}
        />
      </SettingRow>

      {/* ── Editor ───────────────────────────────────────── */}
      <SectionHeader label="Editor" icon="edit-3" colors={colors} />

      <SettingRow
        type="custom"
        label="Font Family"
        icon="type"
        description="Serif for poetry, mono for code-like feel"
      >
        <SegmentedControl
          options={FONT_FAMILY_OPTIONS}
          labels={FONT_FAMILY_LABELS}
          value={settings.editorFontFamily}
          onValueChange={setEditorFontFamily}
        />
      </SettingRow>

      <SettingRow
        type="custom"
        label="Font Size"
        icon="maximize-2"
      >
        <SegmentedControl
          options={FONT_SIZE_OPTIONS}
          labels={FONT_SIZE_LABELS}
          value={settings.editorFontSize}
          onValueChange={setEditorFontSize}
        />
      </SettingRow>

      <SettingRow
        type="toggle"
        label="Line Numbers"
        icon="hash"
        description="Show line numbers in the editor gutter"
        value={settings.showLineNumbers}
        onValueChange={toggleLineNumbers}
      />

      <SettingRow
        type="toggle"
        label="Syllable Counter"
        icon="bar-chart-2"
        description="Display syllable count per line"
        value={settings.showSyllableCounter}
        onValueChange={toggleSyllableCounter}
      />

      {/* ── Voice & TTS ──────────────────────────────────── */}
      <SectionHeader label="Voice & TTS" icon="mic" colors={colors} />

      <SettingRow
        type="navigate"
        label="Recognition Language"
        icon="globe"
        detail={settings.voiceRecognitionLang}
        description="Language for voice-to-text"
        onPress={() => {
          // TODO: Open language picker modal
        }}
      />

      <SettingRow
        type="custom"
        label="Speech Rate"
        icon="volume-2"
        description={`Playback speed for TTS preview (${TTS_DEFAULTS.MIN_RATE}x - ${TTS_DEFAULTS.MAX_RATE}x)`}
      >
        <TtsRateControl
          rate={settings.ttsRate}
          label={ttsRateLabel}
          onDecrement={() => adjustTtsRate(-0.1)}
          onIncrement={() => adjustTtsRate(0.1)}
          colors={colors}
        />
      </SettingRow>

      {/* ── Recitation Defaults ──────────────────────────── */}
      <SectionHeader label="Recitation" icon="headphones" colors={colors} />

      <SettingRow
        type="custom"
        label="Default Pace"
        icon="activity"
        description="Pace for AI-generated audio recitations"
      >
        <SegmentedControl
          options={PACE_OPTIONS}
          labels={PACE_LABELS}
          value={settings.recitationPace}
          onValueChange={setRecitationPace}
        />
      </SettingRow>

      {/* ── Review Defaults ──────────────────────────────── */}
      <SectionHeader label="AI Review" icon="book-open" colors={colors} />

      <SettingRow
        type="custom"
        label="Review Tone"
        icon="message-circle"
        description="Tone for AI-generated poem reviews"
      >
        <SegmentedControl
          options={TONE_OPTIONS}
          labels={TONE_LABELS}
          value={settings.reviewTone}
          onValueChange={setReviewTone}
        />
      </SettingRow>

      {/* ── API Keys ─────────────────────────────────────── */}
      <SectionHeader label="AI Services" icon="cpu" colors={colors} />

      <View style={styles.apiSection}>
        <Text style={[styles.apiNote, { color: colors.textSecondary }]}>
          Enter your API keys to enable AI-powered reviews and audio recitations.
          Keys are stored securely on your device.
        </Text>

        <ApiKeyInput
          label="Anthropic API Key"
          value={keys.anthropic ?? ''}
          placeholder="sk-ant-..."
          onChangeText={setAnthropicKey}
          onClear={clearAnthropicKey}
          validate={(key) => key.startsWith('sk-ant-') && key.length > 20}
          helpText="Required for AI poem reviews (Claude)"
        />

        <ApiKeyInput
          label="ElevenLabs API Key"
          value={keys.elevenlabs ?? ''}
          placeholder="Enter your ElevenLabs key"
          onChangeText={setElevenLabsKey}
          onClear={clearElevenLabsKey}
          validate={(key) => key.length > 10}
          helpText="Required for audio recitation generation"
        />
      </View>

      {/* ── Sharing ──────────────────────────────────────── */}
      <SectionHeader label="Sharing" icon="share-2" colors={colors} />

      <SettingRow
        type="toggle"
        label="InkWell Watermark"
        icon="feather"
        description={'Show "Written in InkWell" on shared content'}
        value={settings.shareWatermark}
        onValueChange={toggleShareWatermark}
      />

      {/* ── About ────────────────────────────────────────── */}
      <SectionHeader label="About" icon="info" colors={colors} />

      <SettingRow
        type="navigate"
        label="Version"
        icon="tag"
        detail={APP_VERSION}
        onPress={() => {
          // Easter egg: tap to see build info
        }}
      />

      <SettingRow
        type="navigate"
        label="Acknowledgements"
        icon="heart"
        onPress={() => {
          // TODO: Navigate to acknowledgements
        }}
      />

      {/* ── Reset ────────────────────────────────────────── */}
      <View style={styles.resetSection}>
        <SettingRow
          type="button"
          label="Reset to Defaults"
          icon="refresh-cw"
          destructive
          onPress={handleReset}
        />
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ─── Section Header Sub-component ────────────────────────────

interface SectionHeaderProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

function SectionHeader({ label, icon, colors }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
      <Feather name={icon} size={14} color={colors.secondary} style={styles.sectionIcon} />
      <Text style={[styles.sectionLabel, { color: colors.secondary }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── TTS Rate Control Sub-component ─────────────────────────

interface TtsRateControlProps {
  rate: number;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

function TtsRateControl({ rate, label, onDecrement, onIncrement, colors }: TtsRateControlProps) {
  const canDecrement = rate > TTS_DEFAULTS.MIN_RATE + 0.05;
  const canIncrement = rate < TTS_DEFAULTS.MAX_RATE - 0.05;

  return (
    <View style={styles.rateControl}>
      <RateButton
        icon="minus"
        onPress={onDecrement}
        disabled={!canDecrement}
        colors={colors}
      />
      <Text style={[styles.rateLabel, { color: colors.text }]}>{label}</Text>
      <RateButton
        icon="plus"
        onPress={onIncrement}
        disabled={!canIncrement}
        colors={colors}
      />
    </View>
  );
}

interface RateButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

function RateButton({ icon, onPress, disabled, colors }: RateButtonProps) {
  return (
    <View
      style={[
        styles.rateBtn,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Feather
        name={icon}
        size={14}
        color={colors.text}
        onPress={disabled ? undefined : onPress}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionIcon: {
    marginRight: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // API section
  apiSection: {
    paddingTop: Spacing.sm,
  },
  apiNote: {
    fontSize: FontSize.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },

  // Reset section
  resetSection: {
    marginTop: Spacing.lg,
  },

  // TTS rate control
  rateControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rateBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'center',
  },

  // Bottom spacer
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
