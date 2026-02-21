/**
 * Segmented Control
 *
 * A segmented picker for selecting one option from a set.
 * Used in Settings for theme, font size, recitation pace, review tone.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  labels?: readonly string[];
  value: T;
  onValueChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({
  options,
  labels,
  value,
  onValueChange,
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {options.map((option, idx) => {
        const isActive = option === value;
        const displayLabel = labels ? labels[idx] : option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.segment,
              isActive && { backgroundColor: colors.primary },
            ]}
            onPress={() => onValueChange(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: isActive ? '#FFFFFF' : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {displayLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 2,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm - 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
