/**
 * Poem Card
 *
 * Compact card for displaying a poem in lists (collection detail, search results, etc.).
 * Shows title, preview, status badge, source indicator, stats, and favorite toggle.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import type { Poem } from '../types';

interface PoemCardProps {
  poem: Poem;
  onPress: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  showSource?: boolean;
}

export default function PoemCard({
  poem,
  onPress,
  onToggleFavorite,
  showSource = false,
}: PoemCardProps) {
  const { colors } = useAppTheme();

  const preview = poem.body
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .slice(0, 2)
    .join('\n');

  const isImported =
    poem.source.type === 'imported' || poem.source.type === 'poetrydb';
  const isComplete = poem.status === 'complete';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(poem.id)}
      activeOpacity={0.6}
    >
      {/* Left accent bar */}
      <View
        style={[
          styles.accent,
          {
            backgroundColor: isImported
              ? colors.imported
              : isComplete
                ? colors.success
                : colors.warning,
          },
        ]}
      />

      <View style={styles.content}>
        {/* Top row: title + favorite */}
        <View style={styles.topRow}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              !poem.title && { color: colors.textSecondary, fontStyle: 'italic' },
            ]}
            numberOfLines={1}
          >
            {poem.title || 'Untitled'}
          </Text>
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={() => onToggleFavorite(poem.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name="heart"
                size={16}
                color={poem.isFavorite ? colors.secondary : colors.border}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Preview */}
        {preview ? (
          <Text
            style={[styles.preview, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {preview}
          </Text>
        ) : null}

        {/* Bottom row: badges + stats */}
        <View style={styles.bottomRow}>
          <View style={styles.badges}>
            {/* Status */}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isComplete
                    ? colors.success + '18'
                    : colors.warning + '18',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isComplete ? colors.success : colors.warning },
                ]}
              >
                {isComplete ? 'Complete' : 'Draft'}
              </Text>
            </View>

            {/* Source (optional) */}
            {showSource && isImported && (
              <View style={[styles.badge, { backgroundColor: colors.imported + '18' }]}>
                <Text style={[styles.badgeText, { color: colors.imported }]}>
                  Imported
                </Text>
              </View>
            )}

            {/* Form type */}
            {poem.formType && (
              <View style={[styles.badge, { backgroundColor: colors.tertiary + '18' }]}>
                <Text style={[styles.badgeText, { color: colors.tertiary }]}>
                  {poem.formType.replace(/-/g, ' ')}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.stats, { color: colors.textSecondary }]}>
            {poem.wordCount}w · {poem.lineCount}l
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  accent: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  preview: {
    fontSize: FontSize.sm,
    fontFamily: 'serif',
    lineHeight: FontSize.sm * 1.6,
    marginTop: Spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  stats: {
    fontSize: FontSize.xs,
  },
});
