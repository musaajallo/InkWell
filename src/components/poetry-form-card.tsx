/**
 * Poetry Form Card
 *
 * Compact card for horizontal scroll display of poetry forms.
 * Shows form name, origin, and a brief description.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface PoetryFormCardProps {
  name: string;
  origin: string;
  description: string;
  lineCount: number | null;
  onPress: () => void;
}

export default function PoetryFormCard({
  name,
  origin,
  description,
  lineCount,
  onPress,
}: PoetryFormCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.tertiary + '15' }]}>
        <Feather name="file-text" size={20} color={colors.tertiary} />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.origin, { color: colors.textSecondary }]} numberOfLines={1}>
        {origin}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {description}
      </Text>
      {lineCount !== null && (
        <View style={styles.metaRow}>
          <Feather name="align-left" size={10} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {lineCount} lines
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    marginRight: Spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  origin: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  metaText: {
    fontSize: FontSize.xs,
  },
});
