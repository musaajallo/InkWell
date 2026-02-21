/**
 * Collection Card
 *
 * Displays a collection with cover color, icon, name, description, and poem count.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface CollectionCardProps {
  name: string;
  description: string;
  coverColor: string;
  iconName: string;
  poemCount: number;
  isAnthology?: boolean;
  onPress: () => void;
}

export default function CollectionCard({
  name,
  description,
  coverColor,
  iconName,
  poemCount,
  isAnthology = false,
  onPress,
}: CollectionCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Color accent bar */}
      <View style={[styles.colorBar, { backgroundColor: coverColor }]} />

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: coverColor + '20' }]}>
          <Feather
            name={iconName as keyof typeof Feather.glyphMap}
            size={20}
            color={coverColor}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            {isAnthology && (
              <View style={[styles.anthologyBadge, { backgroundColor: colors.secondary + '15' }]}>
                <Feather name="book" size={10} color={colors.secondary} />
                <Text style={[styles.anthologyText, { color: colors.secondary }]}>
                  Anthology
                </Text>
              </View>
            )}
          </View>
          {description.length > 0 && (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {description}
            </Text>
          )}
          <Text style={[styles.poemCount, { color: colors.textSecondary }]}>
            {poemCount} {poemCount === 1 ? 'poem' : 'poems'}
          </Text>
        </View>

        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  colorBar: {
    height: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    flexShrink: 1,
  },
  anthologyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  anthologyText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  poemCount: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
