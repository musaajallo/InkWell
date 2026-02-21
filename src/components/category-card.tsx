/**
 * Category Card
 *
 * Tappable card for browsing writing prompts by category.
 * Displays an icon, category name, and prompt count.
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface CategoryCardProps {
  name: string;
  iconName: keyof typeof Feather.glyphMap;
  color: string;
  promptCount: number;
  onPress: () => void;
}

export default function CategoryCard({
  name,
  iconName,
  color,
  promptCount,
  onPress,
}: CategoryCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Feather name={iconName} size={22} color={color} />
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {promptCount} prompts
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 100,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.sm,
    textTransform: 'capitalize',
  },
  count: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
