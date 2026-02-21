/**
 * Tag Chip
 *
 * Small pill-shaped badge for displaying poem tags.
 * Optionally tappable for filtering.
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface TagChipProps {
  label: string;
  onPress?: () => void;
  color?: string;
  variant?: 'default' | 'outlined';
}

export default function TagChip({
  label,
  onPress,
  color,
  variant = 'default',
}: TagChipProps) {
  const { colors } = useAppTheme();
  const chipColor = color ?? colors.tertiary;

  const chipStyle =
    variant === 'outlined'
      ? [styles.chip, { borderColor: chipColor, borderWidth: 1 }]
      : [styles.chip, { backgroundColor: chipColor + '18' }];

  const textColor = variant === 'outlined' ? chipColor : chipColor;

  const content = (
    <View style={chipStyle}>
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
