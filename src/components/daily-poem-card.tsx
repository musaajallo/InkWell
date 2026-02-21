import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface DailyPoemCardProps {
  title: string;
  author: string;
  lines: string[];
  onTTSPress: () => void;
  onSavePress: () => void;
}

export default function DailyPoemCard({
  title,
  author,
  lines,
  onTTSPress,
  onSavePress,
}: DailyPoemCardProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        DAILY POEM
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.author, { color: colors.textSecondary }]}>
        by {author}
      </Text>
      <View style={styles.poemBody}>
        {lines.slice(0, 8).map((line, index) => (
          <Text
            key={index}
            style={[styles.poemLine, { color: colors.text }]}
          >
            {line}
          </Text>
        ))}
        {lines.length > 8 && (
          <Text style={[styles.moreLines, { color: colors.textSecondary }]}>
            ...
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onTTSPress}
          activeOpacity={0.7}
        >
          <Feather name="volume-2" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Listen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onSavePress}
          activeOpacity={0.7}
        >
          <Feather name="bookmark" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: Spacing.xs,
  },
  author: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  poemBody: {
    marginBottom: Spacing.lg,
  },
  poemLine: {
    fontSize: FontSize.lg,
    fontFamily: 'serif',
    lineHeight: 28,
  },
  moreLines: {
    fontSize: FontSize.lg,
    fontFamily: 'serif',
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
