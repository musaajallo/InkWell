/**
 * Poetry Form Detail Screen
 *
 * Displays a single poetry form: name, origin, description,
 * structural rules, rhyme scheme, syllable pattern, and examples.
 * Fetches data from Supabase via the usePoetryForm hook.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { usePoetryForm } from '../../src/hooks/use-poetry-forms';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

// ─── Component ──────────────────────────────────────────────

export default function FormDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();

  const { form, loading, error } = usePoetryForm(slug);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const handleStartWriting = useCallback(() => {
    router.push('/(tabs)/write');
  }, [router]);

  // ─── Loading ──────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={[styles.notFoundSub, { color: colors.textSecondary }]}>
          Loading form...
        </Text>
      </View>
    );
  }

  // ─── Not Found / Error ────────────────────────────────────

  if (!form) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="help-circle" size={48} color={colors.border} />
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>
          Form not found
        </Text>
        <Text style={[styles.notFoundSub, { color: colors.textSecondary }]}>
          {error ?? "This poetry form hasn't been added yet."}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {form.name}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.formName, { color: colors.text }]}>
            {form.name}
          </Text>
          <Text style={[styles.origin, { color: colors.secondary }]}>
            {form.origin.split('.')[0]}
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.text }]}>
          {form.description}
        </Text>

        {/* Quick Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <QuickStat
            label="Lines"
            value={form.lineCount ? String(form.lineCount) : 'Variable'}
            colors={colors}
          />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <QuickStat
            label="Rhyme"
            value={form.rhymeScheme ? 'Yes' : 'None'}
            colors={colors}
          />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <QuickStat
            label="Syllables"
            value={form.syllablePattern ? 'Fixed' : 'Free'}
            colors={colors}
          />
        </View>

        {/* Syllable Pattern (if any) */}
        {form.syllablePattern && (
          <Section title="Syllable Pattern" colors={colors}>
            <View style={styles.syllableRow}>
              {form.syllablePattern.map((count, idx) => (
                <View
                  key={idx}
                  style={[styles.syllableChip, { backgroundColor: colors.secondary + '18' }]}
                >
                  <Text style={[styles.syllableNum, { color: colors.secondary }]}>
                    {count}
                  </Text>
                  <Text style={[styles.syllableLabel, { color: colors.textSecondary }]}>
                    L{idx + 1}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Rhyme Scheme */}
        {form.rhymeScheme && (
          <Section title="Rhyme Scheme" colors={colors}>
            <Text style={[styles.rhymeScheme, { color: colors.text, backgroundColor: colors.surface }]}>
              {form.rhymeScheme}
            </Text>
          </Section>
        )}

        {/* Rules */}
        <Section title="Structure Rules" colors={colors}>
          {form.rules.map((rule, idx) => (
            <View key={idx} style={styles.ruleRow}>
              <Feather name="check" size={14} color={colors.success} style={styles.ruleIcon} />
              <Text style={[styles.ruleText, { color: colors.text }]}>
                {rule}
              </Text>
            </View>
          ))}
        </Section>

        {/* Origin */}
        <Section title="History" colors={colors}>
          <Text style={[styles.historyText, { color: colors.text }]}>
            {form.origin}
          </Text>
        </Section>

        {/* Examples */}
        {form.examples.length > 0 && (
          <Section title="Examples" colors={colors}>
            {form.examples.map((example, idx) => (
              <View
                key={idx}
                style={[styles.exampleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.exampleTitle, { color: colors.text }]}>
                  {example.title}
                </Text>
                <Text style={[styles.exampleAuthor, { color: colors.textSecondary }]}>
                  {example.author}
                </Text>
                <View style={[styles.exampleDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  {example.text}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={handleStartWriting}
          activeOpacity={0.7}
        >
          <Feather name="feather" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>Write a {form.name}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────

interface SectionProps {
  title: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  children: React.ReactNode;
}

function Section({ title, colors, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

interface QuickStatProps {
  label: string;
  value: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

function QuickStat({ label, value, colors }: QuickStatProps) {
  return (
    <View style={styles.quickStat}>
      <Text style={[styles.quickStatValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

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
  notFoundSub: {
    fontSize: FontSize.md,
    textAlign: 'center',
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },

  // Hero
  hero: {
    marginBottom: Spacing.md,
  },
  formName: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  origin: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },

  // Description
  description: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.6,
    marginBottom: Spacing.lg,
  },

  // Quick stats
  statsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    marginVertical: 2,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // Syllable pattern
  syllableRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  syllableChip: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 48,
  },
  syllableNum: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  syllableLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  // Rhyme scheme
  rhymeScheme: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    textAlign: 'center',
    overflow: 'hidden',
  },

  // Rules
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  ruleIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  ruleText: {
    fontSize: FontSize.md,
    flex: 1,
    lineHeight: FontSize.md * 1.5,
  },

  // History
  historyText: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.6,
  },

  // Examples
  exampleCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exampleTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  exampleAuthor: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginTop: 2,
  },
  exampleDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  exampleText: {
    fontSize: FontSize.md,
    fontFamily: 'serif',
    lineHeight: FontSize.md * 1.75,
  },

  // CTA
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },

  bottomSpacer: {
    height: Spacing.xxl,
  },
});
