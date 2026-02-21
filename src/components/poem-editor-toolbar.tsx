/**
 * Poem Editor Toolbar
 *
 * Bottom toolbar displaying word count, line count, and action buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface PoemEditorToolbarProps {
  wordCount: number;
  lineCount: number;
  isRecording: boolean;
  onMicPress: () => void;
  onUndoPress?: () => void;
  onRedoPress?: () => void;
  onRhymePress?: () => void;
}

export default function PoemEditorToolbar({
  wordCount,
  lineCount,
  isRecording,
  onMicPress,
  onUndoPress,
  onRedoPress,
  onRhymePress,
}: PoemEditorToolbarProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Stats */}
      <View style={styles.stats}>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          {lineCount} {lineCount === 1 ? 'line' : 'lines'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onUndoPress && (
          <TouchableOpacity onPress={onUndoPress} style={styles.actionButton} activeOpacity={0.6}>
            <Feather name="corner-up-left" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {onRedoPress && (
          <TouchableOpacity onPress={onRedoPress} style={styles.actionButton} activeOpacity={0.6}>
            <Feather name="corner-up-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {onRhymePress && (
          <TouchableOpacity onPress={onRhymePress} style={styles.actionButton} activeOpacity={0.6}>
            <Feather name="music" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Mic button */}
        <TouchableOpacity
          onPress={onMicPress}
          style={[
            styles.micButton,
            {
              backgroundColor: isRecording ? colors.voiceActive : colors.primary,
            },
          ]}
          activeOpacity={0.7}
        >
          <Feather
            name={isRecording ? 'mic-off' : 'mic'}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statText: {
    fontSize: FontSize.sm,
    fontFamily: 'monospace',
  },
  divider: {
    width: 1,
    height: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
