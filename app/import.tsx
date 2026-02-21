/**
 * Import Poem Screen
 *
 * Wizard-style import: paste text, enter metadata, save to library.
 * Future phases will add OCR, file upload, URL scraping, and PoetryDB search.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { usePoemStore } from '../src/stores/poem-store';
import { useAuthStore } from '../src/stores/auth-store';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import { countWords } from '../src/utils/text-formatter';

type ImportStep = 'source' | 'text' | 'meta' | 'done';

export default function ImportScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const createPoem = usePoemStore((s) => s.createPoem);
  const userId = useAuthStore((s) => s.user?.id);

  const [step, setStep] = useState<ImportStep>('source');
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [sourceBook, setSourceBook] = useState('');
  const [tags, setTags] = useState('');
  const [savedPoemId, setSavedPoemId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    if (step === 'source') {
      if (router.canGoBack()) router.back();
    } else if (step === 'text') {
      setStep('source');
    } else if (step === 'meta') {
      setStep('text');
    } else {
      if (router.canGoBack()) router.back();
    }
  }, [step, router]);

  const handlePasteText = useCallback(() => {
    setStep('text');
  }, []);

  const handleTextNext = useCallback(() => {
    if (!body.trim()) {
      Alert.alert('Empty Poem', 'Please paste or type the poem text.');
      return;
    }
    setStep('meta');
  }, [body]);

  const handleSave = useCallback(() => {
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newPoem = createPoem({
      title: title.trim() || 'Untitled Import',
      body: body.trim(),
      formType: null,
      source: {
        type: 'imported',
        method: 'text',
        author: author.trim() || undefined,
        sourceBook: sourceBook.trim() || undefined,
        importedAt: new Date().toISOString(),
      },
    }, userId);

    // Add tags after creation
    const poemId = newPoem.id;
    const updatePoem = usePoemStore.getState().updatePoem;
    updatePoem(poemId, { tags: tagList });

    setSavedPoemId(poemId);
    setStep('done');
  }, [title, body, author, sourceBook, tags, createPoem, userId]);

  const handleViewPoem = useCallback(() => {
    if (savedPoemId) {
      router.replace(`/poem/${savedPoemId}`);
    }
  }, [savedPoemId, router]);

  const handleImportAnother = useCallback(() => {
    setBody('');
    setTitle('');
    setAuthor('');
    setSourceBook('');
    setTags('');
    setSavedPoemId(null);
    setStep('source');
  }, []);

  // ─── Step Indicator ────────────────────────────────────────

  const steps: { key: ImportStep; label: string }[] = [
    { key: 'source', label: 'Source' },
    { key: 'text', label: 'Text' },
    { key: 'meta', label: 'Details' },
    { key: 'done', label: 'Done' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  // ─── Render ────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name={step === 'done' ? 'x' : 'arrow-left'} size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Import Poem</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {steps.map((s, i) => (
          <View key={s.key} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: i <= currentStepIndex ? colors.secondary : colors.border,
                },
              ]}
            >
              {i < currentStepIndex ? (
                <Feather name="check" size={10} color="#FFFFFF" />
              ) : (
                <Text style={styles.stepNum}>{i + 1}</Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                { color: i <= currentStepIndex ? colors.text : colors.textSecondary },
              ]}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Step: Source */}
        {step === 'source' && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>How would you like to import?</Text>

            <TouchableOpacity
              style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handlePasteText}
              activeOpacity={0.7}
            >
              <View style={[styles.sourceIcon, { backgroundColor: colors.secondary + '15' }]}>
                <Feather name="clipboard" size={24} color={colors.secondary} />
              </View>
              <View style={styles.sourceInfo}>
                <Text style={[styles.sourceName, { color: colors.text }]}>Paste Text</Text>
                <Text style={[styles.sourceDesc, { color: colors.textSecondary }]}>
                  Paste or type a poem directly
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Future import methods — disabled for now */}
            {[
              { icon: 'camera' as const, name: 'Scan with Camera', desc: 'OCR text recognition', disabled: true },
              { icon: 'file-text' as const, name: 'From File', desc: 'Import .txt or .pdf', disabled: true },
              { icon: 'globe' as const, name: 'From URL', desc: 'Scrape a web page', disabled: true },
              { icon: 'book-open' as const, name: 'PoetryDB', desc: 'Browse classic poems', disabled: true },
            ].map((method) => (
              <TouchableOpacity
                key={method.name}
                style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.5 }]}
                disabled
              >
                <View style={[styles.sourceIcon, { backgroundColor: colors.border + '30' }]}>
                  <Feather name={method.icon} size={24} color={colors.textSecondary} />
                </View>
                <View style={styles.sourceInfo}>
                  <Text style={[styles.sourceName, { color: colors.textSecondary }]}>{method.name}</Text>
                  <Text style={[styles.sourceDesc, { color: colors.textSecondary }]}>{method.desc} — Coming soon</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step: Text Input */}
        {step === 'text' && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Paste the poem</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              multiline
              placeholder="Paste or type the poem here..."
              placeholderTextColor={colors.textSecondary}
              value={body}
              onChangeText={setBody}
              textAlignVertical="top"
              autoFocus
            />
            {body.trim().length > 0 && (
              <Text style={[styles.wordCount, { color: colors.textSecondary }]}>
                {countWords(body)} words · {body.split('\n').filter(Boolean).length} lines
              </Text>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: body.trim() ? colors.primary : colors.border }]}
              onPress={handleTextNext}
              disabled={!body.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.nextBtnText}>Next</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Metadata */}
        {step === 'meta' && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Add details</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                placeholder="Poem title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Author</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                placeholder="Original author"
                placeholderTextColor={colors.textSecondary}
                value={author}
                onChangeText={setAuthor}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Source / Book</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                placeholder="Book or publication (optional)"
                placeholderTextColor={colors.textSecondary}
                value={sourceBook}
                onChangeText={setSourceBook}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tags</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                placeholder="love, nature, loss (comma-separated)"
                placeholderTextColor={colors.textSecondary}
                value={tags}
                onChangeText={setTags}
              />
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Feather name="download" size={18} color="#FFFFFF" />
              <Text style={styles.nextBtnText}>Save to Library</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <View style={styles.doneContent}>
            <View style={[styles.doneIcon, { backgroundColor: colors.success + '15' }]}>
              <Feather name="check-circle" size={48} color={colors.success} />
            </View>
            <Text style={[styles.doneTitle, { color: colors.text }]}>Poem Imported</Text>
            <Text style={[styles.doneSubtitle, { color: colors.textSecondary }]}>
              "{title || 'Untitled Import'}" has been saved to your library.
            </Text>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={handleViewPoem}
              activeOpacity={0.7}
            >
              <Feather name="book-open" size={18} color="#FFFFFF" />
              <Text style={styles.nextBtnText}>View Poem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.border }]}
              onPress={handleImportAnother}
            >
              <Feather name="plus" size={18} color={colors.text} />
              <Text style={[styles.outlineBtnText, { color: colors.text }]}>Import Another</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl + Spacing.sm, paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700' },

  // Step indicator
  stepRow: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  stepLabel: { fontSize: FontSize.xs },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  stepContent: { gap: Spacing.md },
  stepTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.xs },

  // Source cards
  sourceCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
  },
  sourceIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  sourceInfo: { flex: 1 },
  sourceName: { fontSize: FontSize.md, fontWeight: '600' },
  sourceDesc: { fontSize: FontSize.sm, marginTop: 2 },

  // Text input
  textArea: {
    minHeight: 200, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md, fontSize: FontSize.md, fontFamily: 'serif', lineHeight: FontSize.md * 1.75,
  },
  wordCount: { fontSize: FontSize.sm, textAlign: 'right' },

  // Fields
  fieldGroup: { marginBottom: Spacing.xs },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  input: {
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
  },

  // Buttons
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4, borderRadius: BorderRadius.lg, marginTop: Spacing.sm,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700' },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4, borderRadius: BorderRadius.lg, borderWidth: 1.5,
  },
  outlineBtnText: { fontSize: FontSize.md, fontWeight: '600' },

  // Done
  doneContent: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  doneIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: FontSize.xxl, fontWeight: '700' },
  doneSubtitle: { fontSize: FontSize.md, textAlign: 'center' },

  bottomSpacer: { height: Spacing.xxl },
});
