/**
 * Filter Toggle
 *
 * Horizontal pill-style toggle for filtering content.
 * Supports multiple options with a single active selection.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface FilterToggleProps {
  options: string[];
  activeOption: string;
  onSelect: (option: string) => void;
}

export default function FilterToggle({
  options,
  activeOption,
  onSelect,
}: FilterToggleProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {options.map((option) => {
        const isActive = option === activeOption;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              isActive && { backgroundColor: colors.primary },
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {option}
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
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 2,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
