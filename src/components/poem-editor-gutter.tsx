/**
 * Poem Editor Gutter
 *
 * Displays line numbers and syllable counts alongside the poem text.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize } from '../constants/theme';

interface GutterLine {
  lineNumber: number;
  syllableCount: number;
  isStanzaBreak: boolean;
}

interface PoemEditorGutterProps {
  lines: GutterLine[];
  showLineNumbers: boolean;
  showSyllableCount: boolean;
  fontSize: number;
}

export default function PoemEditorGutter({
  lines,
  showLineNumbers,
  showSyllableCount,
  fontSize,
}: PoemEditorGutterProps) {
  const { colors } = useAppTheme();

  if (!showLineNumbers && !showSyllableCount) return null;

  return (
    <View style={styles.container}>
      {lines.map((line, index) => (
        <View
          key={index}
          style={[
            styles.gutterLine,
            { height: line.isStanzaBreak ? fontSize * 0.8 : fontSize * 1.8 },
          ]}
        >
          {line.isStanzaBreak ? null : (
            <>
              {showLineNumbers && (
                <Text
                  style={[
                    styles.lineNumber,
                    { color: colors.textSecondary, fontSize: fontSize * 0.75 },
                  ]}
                >
                  {line.lineNumber}
                </Text>
              )}
              {showSyllableCount && (
                <Text
                  style={[
                    styles.syllableCount,
                    { color: colors.secondary, fontSize: fontSize * 0.65 },
                  ]}
                >
                  {line.syllableCount > 0 ? line.syllableCount : ''}
                </Text>
              )}
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    alignItems: 'flex-end',
    minWidth: 48,
    paddingRight: Spacing.sm,
  },
  gutterLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  lineNumber: {
    fontFamily: 'monospace',
    opacity: 0.6,
  },
  syllableCount: {
    fontFamily: 'monospace',
    fontWeight: '600',
    minWidth: 16,
    textAlign: 'right',
  },
});
