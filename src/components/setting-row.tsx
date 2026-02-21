/**
 * Setting Row
 *
 * Reusable row for the Settings screen. Supports:
 * - Label + optional description
 * - Right-side control: toggle switch, chevron, or custom content
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface SettingRowBaseProps {
  label: string;
  description?: string;
  icon?: keyof typeof Feather.glyphMap;
}

interface ToggleRowProps extends SettingRowBaseProps {
  type: 'toggle';
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface NavigateRowProps extends SettingRowBaseProps {
  type: 'navigate';
  detail?: string;
  onPress: () => void;
}

interface CustomRowProps extends SettingRowBaseProps {
  type: 'custom';
  children: React.ReactNode;
}

interface ButtonRowProps extends SettingRowBaseProps {
  type: 'button';
  destructive?: boolean;
  onPress: () => void;
}

type SettingRowProps = ToggleRowProps | NavigateRowProps | CustomRowProps | ButtonRowProps;

export default function SettingRow(props: SettingRowProps) {
  const { colors } = useAppTheme();

  const renderRight = () => {
    switch (props.type) {
      case 'toggle':
        return (
          <Switch
            value={props.value}
            onValueChange={props.onValueChange}
            trackColor={{ false: colors.border, true: colors.secondary }}
            thumbColor="#FFFFFF"
          />
        );
      case 'navigate':
        return (
          <View style={styles.navigateRight}>
            {props.detail ? (
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                {props.detail}
              </Text>
            ) : null}
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </View>
        );
      case 'custom':
        return <>{props.children}</>;
      case 'button':
        return null;
      default:
        return null;
    }
  };

  const isButton = props.type === 'button';
  const isTappable = props.type === 'navigate' || props.type === 'button';

  const content = (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        {props.icon ? (
          <Feather
            name={props.icon}
            size={18}
            color={isButton && props.destructive ? colors.error : colors.textSecondary}
            style={styles.icon}
          />
        ) : null}
        <View style={styles.labels}>
          <Text
            style={[
              styles.label,
              {
                color: isButton && props.destructive ? colors.error : colors.text,
              },
            ]}
          >
            {props.label}
          </Text>
          {props.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {props.description}
            </Text>
          ) : null}
        </View>
      </View>
      {renderRight()}
    </View>
  );

  if (isTappable) {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={'onPress' in props ? props.onPress : undefined}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  labels: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  description: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  navigateRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detail: {
    fontSize: FontSize.sm,
  },
});
