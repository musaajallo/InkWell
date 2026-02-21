/**
 * API Key Input
 *
 * Secure text input for entering API keys (OpenAI, ElevenLabs).
 * Features:
 * - Masked input with show/hide toggle
 * - Validation indicator (key format check)
 * - Clear button
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface ApiKeyInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  validate?: (key: string) => boolean;
  helpText?: string;
}

export default function ApiKeyInput({
  label,
  value,
  placeholder,
  onChangeText,
  onClear,
  validate,
  helpText,
}: ApiKeyInputProps) {
  const { colors } = useAppTheme();
  const [isVisible, setIsVisible] = useState(false);

  const isValid = value.length > 0 && (!validate || validate(value));
  const hasValue = value.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {hasValue && (
          <View style={styles.statusBadge}>
            <Feather
              name={isValid ? 'check-circle' : 'alert-circle'}
              size={14}
              color={isValid ? colors.success : colors.warning}
            />
            <Text
              style={[
                styles.statusText,
                { color: isValid ? colors.success : colors.warning },
              ]}
            >
              {isValid ? 'Valid' : 'Check key'}
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.surface,
            borderColor: hasValue
              ? isValid
                ? colors.success
                : colors.warning
              : colors.border,
          },
        ]}
      >
        <Feather name="key" size={16} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        {hasValue && (
          <>
            <TouchableOpacity
              onPress={() => setIsVisible((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionBtn}
            >
              <Feather
                name={isVisible ? 'eye-off' : 'eye'}
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionBtn}
            >
              <Feather name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {helpText ? (
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          {helpText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  inputIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: 'monospace',
    paddingVertical: 0,
  },
  actionBtn: {
    padding: Spacing.xs,
  },
  helpText: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
