/**
 * Icon Button
 *
 * A small tappable icon with optional label.
 * Used for action bars and toolbars.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label?: string;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  badge?: string | number;
}

export default function IconButton({
  icon,
  label,
  onPress,
  color,
  size = 20,
  disabled = false,
  badge,
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const iconColor = disabled ? colors.border : (color ?? colors.text);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View>
        <Feather name={icon} size={size} color={iconColor} />
        {badge !== undefined && (
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {label ? (
        <Text
          style={[styles.label, { color: iconColor }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    minWidth: 44,
  },
  label: {
    fontSize: FontSize.xs,
    marginTop: 2,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
