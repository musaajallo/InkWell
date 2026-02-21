/**
 * Import Quick Action Card
 *
 * A prominent card encouraging users to import poems from external sources.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface ImportQuickActionProps {
  onPress: () => void;
}

export default function ImportQuickAction({ onPress }: ImportQuickActionProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.imported + '10', borderColor: colors.imported + '30' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.imported + '20' }]}>
        <Feather name="download" size={22} color={colors.imported} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Import a Poem</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          From text, photo, file, or search PoetryDB
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.imported} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
