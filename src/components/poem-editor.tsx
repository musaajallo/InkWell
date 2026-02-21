/**
 * Poem Editor
 *
 * Core editor component with title field, poem body with line numbers,
 * syllable counting, and auto-save support.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { countSyllablesInLine } from '../utils/syllable-counter';
import { countWords, countLines } from '../utils/text-formatter';
import { EDITOR_DEFAULTS } from '../utils/constants';
import PoemEditorGutter from './poem-editor-gutter';
import PoemEditorToolbar from './poem-editor-toolbar';

interface PoemEditorProps {
  initialTitle?: string;
  initialBody?: string;
  showLineNumbers?: boolean;
  showSyllableCounter?: boolean;
  fontFamily?: 'serif' | 'monospace';
  fontSize?: 'small' | 'medium' | 'large';
  onTitleChange?: (title: string) => void;
  onBodyChange?: (body: string) => void;
  onAutoSave?: (title: string, body: string) => void;
  autoSaveInterval?: number;
}

export default function PoemEditor({
  initialTitle = '',
  initialBody = '',
  showLineNumbers = true,
  showSyllableCounter = true,
  fontFamily = 'serif',
  fontSize = 'medium',
  onTitleChange,
  onBodyChange,
  onAutoSave,
  autoSaveInterval = EDITOR_DEFAULTS.AUTO_SAVE_INTERVAL_MS,
}: PoemEditorProps) {
  const { colors } = useAppTheme();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [isRecording, setIsRecording] = useState(false);
  const bodyRef = useRef<TextInput>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedRef = useRef({ title: initialTitle, body: initialBody });

  const fontSizePx = EDITOR_DEFAULTS.FONT_SIZE_MAP[fontSize];

  // Compute gutter data from body text
  const gutterLines = useMemo(() => {
    const lines = body.split('\n');
    let lineNumber = 0;

    return lines.map((line) => {
      const isStanzaBreak = line.trim() === '';
      if (!isStanzaBreak) lineNumber++;

      return {
        lineNumber,
        syllableCount: countSyllablesInLine(line),
        isStanzaBreak,
      };
    });
  }, [body]);

  const wordCount = useMemo(() => countWords(body), [body]);
  const lineCount = useMemo(() => countLines(body), [body]);

  // Handle title change
  const handleTitleChange = useCallback(
    (text: string) => {
      setTitle(text);
      onTitleChange?.(text);
    },
    [onTitleChange]
  );

  // Handle body change
  const handleBodyChange = useCallback(
    (text: string) => {
      setBody(text);
      onBodyChange?.(text);
    },
    [onBodyChange]
  );

  // Auto-save timer
  useEffect(() => {
    if (!onAutoSave) return;

    autoSaveTimerRef.current = setInterval(() => {
      const current = { title, body };
      if (
        current.title !== lastSavedRef.current.title ||
        current.body !== lastSavedRef.current.body
      ) {
        onAutoSave(title, body);
        lastSavedRef.current = current;
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [title, body, autoSaveInterval, onAutoSave]);

  // Mic placeholder
  const handleMicPress = () => {
    setIsRecording((prev) => !prev);
    // TODO: Integrate expo-speech-recognition
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Field */}
        <TextInput
          style={[
            styles.titleInput,
            {
              color: colors.text,
              borderBottomColor: colors.border,
              fontFamily,
              fontSize: fontSizePx + 8,
            },
          ]}
          placeholder="Untitled Poem"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={handleTitleChange}
          returnKeyType="next"
          onSubmitEditing={() => bodyRef.current?.focus()}
          blurOnSubmit={false}
        />

        {/* Editor Area: Gutter + TextInput */}
        <View style={styles.editorRow}>
          <PoemEditorGutter
            lines={gutterLines}
            showLineNumbers={showLineNumbers}
            showSyllableCount={showSyllableCounter}
            fontSize={fontSizePx}
          />
          <TextInput
            ref={bodyRef}
            style={[
              styles.bodyInput,
              {
                color: colors.text,
                fontFamily,
                fontSize: fontSizePx,
                lineHeight: fontSizePx * 1.8,
              },
            ]}
            placeholder="Begin your poem..."
            placeholderTextColor={colors.textSecondary}
            value={body}
            onChangeText={handleBodyChange}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Bottom Toolbar */}
      <PoemEditorToolbar
        wordCount={wordCount}
        lineCount={lineCount}
        isRecording={isRecording}
        onMicPress={handleMicPress}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  titleInput: {
    fontWeight: '700',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  editorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bodyInput: {
    flex: 1,
    minHeight: 300,
    paddingTop: 2,
  },
});
