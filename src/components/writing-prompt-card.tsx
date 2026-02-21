import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface WritingPromptCardProps {
  prompt: string;
  category: string;
  onShuffle: () => void;
}

export default function WritingPromptCard({
  prompt,
  category,
  onShuffle,
}: WritingPromptCardProps) {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="zap" size={14} color={colors.secondary} />
          <Text style={[styles.label, { color: colors.secondary }]}>
            TODAY'S PROMPT
          </Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: colors.secondary + '15' }]}>
          <Text style={[styles.categoryText, { color: colors.secondary }]}>
            {category}
          </Text>
        </View>
      </View>
      <Text style={[styles.promptText, { color: colors.text }]}>
        {prompt}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.writeButton, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/write')}
          activeOpacity={0.8}
        >
          <Feather name="feather" size={16} color="#FFFFFF" />
          <Text style={styles.writeButtonText}>Write from this</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shuffleButton, { backgroundColor: colors.background }]}
          onPress={onShuffle}
          activeOpacity={0.7}
        >
          <Feather name="shuffle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  promptText: {
    fontSize: FontSize.xl,
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 30,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  writeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  writeButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shuffleButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
});
