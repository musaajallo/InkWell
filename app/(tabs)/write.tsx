import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { usePoemStore } from '../../src/stores/poem-store';
import { useSettingsStore } from '../../src/stores/settings-store';
import { useAuthStore } from '../../src/stores/auth-store';
import PoemEditor from '../../src/components/poem-editor';

export default function WriteScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const createPoem = usePoemStore((s) => s.createPoem);
  const updatePoem = usePoemStore((s) => s.updatePoem);
  const userId = useAuthStore((s) => s.user?.id);

  // Create a new poem on mount, store its ID
  const poemIdRef = useRef<string | null>(null);

  useEffect(() => {
    const poem = createPoem(undefined, userId);
    poemIdRef.current = poem.id;
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    if (poemIdRef.current) {
      updatePoem(poemIdRef.current, { title });
    }
  }, [updatePoem]);

  const handleBodyChange = useCallback((body: string) => {
    if (poemIdRef.current) {
      updatePoem(poemIdRef.current, { body });
    }
  }, [updatePoem]);

  const handleAutoSave = useCallback((title: string, body: string) => {
    if (poemIdRef.current) {
      updatePoem(poemIdRef.current, { title, body });
    }
  }, [updatePoem]);

  const handleDone = () => {
    if (poemIdRef.current) {
      updatePoem(poemIdRef.current, { status: 'complete' });
      Alert.alert('Poem Saved', 'Your poem has been marked as complete.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
          New Poem
        </Text>
        <TouchableOpacity
          onPress={handleDone}
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Editor */}
      <PoemEditor
        showLineNumbers={settings.showLineNumbers}
        showSyllableCounter={settings.showSyllableCounter}
        fontFamily={settings.editorFontFamily}
        fontSize={settings.editorFontSize}
        onTitleChange={handleTitleChange}
        onBodyChange={handleBodyChange}
        onAutoSave={handleAutoSave}
        autoSaveInterval={settings.autoSaveInterval}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  doneButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
