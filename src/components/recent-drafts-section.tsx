import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface DraftItem {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  status: 'draft' | 'complete';
}

interface RecentDraftsSectionProps {
  drafts: DraftItem[];
  onDraftPress: (id: string) => void;
}

export default function RecentDraftsSection({
  drafts,
  onDraftPress,
}: RecentDraftsSectionProps) {
  const { colors } = useAppTheme();

  if (drafts.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Feather name="edit-3" size={32} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No poems yet. Start writing!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Recent Drafts
      </Text>
      <FlatList
        data={drafts}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.draftItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onDraftPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.draftContent}>
              <View style={styles.draftHeader}>
                <Text
                  style={[styles.draftTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.title || 'Untitled'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'complete'
                          ? colors.success + '20'
                          : colors.warning + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === 'complete'
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  >
                    {item.status === 'complete' ? 'Complete' : 'Draft'}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.draftPreview, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.preview}
              </Text>
              <Text style={[styles.draftDate, { color: colors.textSecondary }]}>
                {item.updatedAt}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  draftContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  draftTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  draftPreview: {
    fontSize: FontSize.md,
    fontFamily: 'serif',
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  draftDate: {
    fontSize: FontSize.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
  },
});
