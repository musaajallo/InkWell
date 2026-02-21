/**
 * Poem Detail Screen
 *
 * View/edit a single poem. Displays poem content with serif typography,
 * metadata (tags, status, source, stats), and action bar for
 * edit, review, recitation, share, favorite, and delete.
 */

import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePoemStore } from '../../src/stores/poem-store';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { formatRelativeDate, formatFullDate } from '../../src/utils/date';
import TagChip from '../../src/components/tag-chip';
import IconButton from '../../src/components/icon-button';
import type { Poem, PoemSource } from '../../src/types';

export default function PoemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const poem = usePoemStore((s) => s.getPoemById(id));
  const toggleFavorite = usePoemStore((s) => s.toggleFavorite);
  const updatePoem = usePoemStore((s) => s.updatePoem);
  const deletePoem = usePoemStore((s) => s.deletePoem);

  const [isEditing, setIsEditing] = useState(false);

  // ─── Derived ───────────────────────────────────────────────

  const stanzas = useMemo(() => {
    if (!poem) return [];
    return poem.body.split('\n\n').filter((s) => s.trim().length > 0);
  }, [poem?.body]);

  const sourceLabel = useMemo(() => {
    if (!poem) return '';
    return getSourceLabel(poem.source);
  }, [poem?.source]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const handleToggleFavorite = useCallback(() => {
    if (poem) toggleFavorite(poem.id);
  }, [poem, toggleFavorite]);

  const handleToggleStatus = useCallback(() => {
    if (!poem) return;
    const newStatus = poem.status === 'draft' ? 'complete' : 'draft';
    updatePoem(poem.id, { status: newStatus });
  }, [poem, updatePoem]);

  const handleShare = useCallback(async () => {
    if (!poem) return;
    try {
      const content = poem.title
        ? `${poem.title}\n\n${poem.body}`
        : poem.body;
      await Share.share({ message: content });
    } catch {
      // User cancelled or share failed
    }
  }, [poem]);

  const handleReview = useCallback(() => {
    if (poem) {
      router.push(`/poem/${poem.id}/review`);
    }
  }, [poem, router]);

  const handleRecitation = useCallback(() => {
    if (poem) {
      router.push(`/poem/${poem.id}/recitation`);
    }
  }, [poem, router]);

  const handleEdit = useCallback(() => {
    // TODO: Navigate to editor with poem ID
    // For now, toggle a local editing state
    setIsEditing((prev) => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    if (!poem) return;
    Alert.alert(
      'Delete Poem',
      `Are you sure you want to delete "${poem.title || 'Untitled'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePoem(poem.id);
            handleBack();
          },
        },
      ]
    );
  }, [poem, deletePoem, handleBack]);

  const handleCopy = useCallback(async () => {
    if (!poem) return;
    const { default: Clipboard } = await import('react-native/Libraries/Components/Clipboard/Clipboard');
    // Fallback: use Share API as clipboard workaround
    // Real clipboard will use expo-clipboard when installed
    try {
      const content = poem.title
        ? `${poem.title}\n\n${poem.body}`
        : poem.body;
      await Share.share({ message: content });
    } catch {
      // Silently fail
    }
  }, [poem]);

  // ─── Not Found ─────────────────────────────────────────────

  if (!poem) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="file-text" size={48} color={colors.border} />
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>
          Poem not found
        </Text>
        <Text style={[styles.notFoundSub, { color: colors.textSecondary }]}>
          This poem may have been deleted.
        </Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={handleBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Render ────────────────────────────────────────────────

  const isComplete = poem.status === 'complete';
  const hasReview = poem.review !== null;
  const hasRecitations = poem.recitationIds.length > 0;
  const isImported = poem.source.type === 'imported' || poem.source.type === 'poetrydb';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
            <Feather
              name={poem.isFavorite ? 'heart' : 'heart'}
              size={20}
              color={poem.isFavorite ? colors.secondary : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <Feather name="share" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Feather name="trash-2" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status + Source Badge */}
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isComplete
                  ? colors.success + '18'
                  : colors.warning + '18',
              },
            ]}
          >
            <Feather
              name={isComplete ? 'check-circle' : 'edit-3'}
              size={12}
              color={isComplete ? colors.success : colors.warning}
            />
            <Text
              style={[
                styles.statusText,
                { color: isComplete ? colors.success : colors.warning },
              ]}
            >
              {isComplete ? 'Complete' : 'Draft'}
            </Text>
          </View>

          {sourceLabel ? (
            <View
              style={[
                styles.sourceBadge,
                {
                  backgroundColor: isImported
                    ? colors.imported + '18'
                    : colors.tertiary + '18',
                },
              ]}
            >
              <Feather
                name={getSourceIcon(poem.source)}
                size={12}
                color={isImported ? colors.imported : colors.tertiary}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isImported ? colors.imported : colors.tertiary },
                ]}
              >
                {sourceLabel}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        {poem.title ? (
          <Text style={[styles.poemTitle, { color: colors.text }]}>
            {poem.title}
          </Text>
        ) : (
          <Text style={[styles.poemTitle, { color: colors.textSecondary, fontStyle: 'italic' }]}>
            Untitled
          </Text>
        )}

        {/* Attribution (imported poems) */}
        {poem.source.type === 'imported' && poem.source.author ? (
          <Text style={[styles.attribution, { color: colors.textSecondary }]}>
            by {poem.source.author}
          </Text>
        ) : null}

        {/* Form type */}
        {poem.formType ? (
          <Text style={[styles.formType, { color: colors.secondary }]}>
            {poem.formType.replace(/-/g, ' ')}
          </Text>
        ) : null}

        {/* Poem Body */}
        <View style={styles.poemBody}>
          {stanzas.map((stanza, idx) => (
            <View key={idx} style={idx > 0 ? styles.stanzaGap : undefined}>
              {stanza.split('\n').map((line, lineIdx) => (
                <Text
                  key={lineIdx}
                  style={[styles.poemLine, { color: colors.text }]}
                >
                  {line}
                </Text>
              ))}
            </View>
          ))}

          {poem.body.trim().length === 0 && (
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              This poem has no content yet.
            </Text>
          )}
        </View>

        {/* Tags */}
        {poem.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {poem.tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <StatItem icon="file-text" label={`${poem.wordCount} words`} colors={colors} />
          <StatItem icon="list" label={`${poem.lineCount} lines`} colors={colors} />
          <StatItem icon="clock" label={formatRelativeDate(poem.updatedAt)} colors={colors} />
        </View>

        {/* Timestamps */}
        <View style={styles.timestamps}>
          <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
            Created {formatFullDate(poem.createdAt)}
          </Text>
          {poem.createdAt !== poem.updatedAt && (
            <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
              Last edited {formatRelativeDate(poem.updatedAt)}
            </Text>
          )}
        </View>

        {/* Source details (imported poems) */}
        {poem.source.type === 'imported' && (
          <View style={[styles.sourceDetails, { backgroundColor: colors.imported + '0A', borderColor: colors.imported + '30' }]}>
            <Feather name="download" size={14} color={colors.imported} />
            <View style={styles.sourceDetailsText}>
              {poem.source.sourceBook ? (
                <Text style={[styles.sourceDetailLine, { color: colors.text }]}>
                  From: {poem.source.sourceBook}
                </Text>
              ) : null}
              {poem.source.sourceUrl ? (
                <Text style={[styles.sourceDetailLine, { color: colors.imported }]} numberOfLines={1}>
                  {poem.source.sourceUrl}
                </Text>
              ) : null}
              <Text style={[styles.sourceDetailLine, { color: colors.textSecondary }]}>
                Imported via {poem.source.method}
              </Text>
            </View>
          </View>
        )}

        {/* Action Cards */}
        <View style={styles.actionsSection}>
          <Text style={[styles.actionsTitle, { color: colors.text }]}>
            Actions
          </Text>

          <ActionCard
            icon="edit-3"
            title="Edit Poem"
            subtitle="Open in the editor"
            onPress={handleEdit}
            colors={colors}
          />

          <ActionCard
            icon={isComplete ? 'edit-3' : 'check-circle'}
            title={isComplete ? 'Mark as Draft' : 'Mark as Complete'}
            subtitle={isComplete ? 'Move back to drafts' : 'Finalize this poem'}
            onPress={handleToggleStatus}
            colors={colors}
          />

          {isComplete && (
            <>
              <ActionCard
                icon="book-open"
                title="AI Review"
                subtitle={hasReview ? 'View existing review' : 'Get an AI-powered analysis'}
                onPress={handleReview}
                colors={colors}
                badge={hasReview ? 'Done' : undefined}
              />
              <ActionCard
                icon="headphones"
                title="Audio Recitation"
                subtitle={
                  hasRecitations
                    ? `${poem.recitationIds.length} recitation${poem.recitationIds.length > 1 ? 's' : ''}`
                    : 'Generate an audio reading'
                }
                onPress={handleRecitation}
                colors={colors}
                badge={hasRecitations ? String(poem.recitationIds.length) : undefined}
              />
            </>
          )}

          <ActionCard
            icon="share"
            title="Share"
            subtitle="Share as text or styled image"
            onPress={handleShare}
            colors={colors}
          />
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function getSourceLabel(source: PoemSource): string {
  switch (source.type) {
    case 'original':
      return '';
    case 'imported':
      return 'Imported';
    case 'dictated':
      return 'Dictated';
    case 'poetrydb':
      return 'PoetryDB';
    default:
      return '';
  }
}

function getSourceIcon(source: PoemSource): keyof typeof Feather.glyphMap {
  switch (source.type) {
    case 'imported':
      return 'download';
    case 'dictated':
      return 'mic';
    case 'poetrydb':
      return 'globe';
    default:
      return 'feather';
  }
}

// ─── StatItem Sub-component ──────────────────────────────────

interface StatItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

function StatItem({ icon, label, colors }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon} size={13} color={colors.textSecondary} />
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

// ─── ActionCard Sub-component ────────────────────────────────

interface ActionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
  badge?: string;
}

function ActionCard({ icon, title, subtitle, onPress, colors, badge }: ActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '10' }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.actionLabels}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.actionRight}>
        {badge ? (
          <View style={[styles.actionBadge, { backgroundColor: colors.success + '18' }]}>
            <Text style={[styles.actionBadgeText, { color: colors.success }]}>{badge}</Text>
          </View>
        ) : null}
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  notFoundTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  notFoundSub: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FontSize.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerBtn: {
    padding: 4,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Title
  poemTitle: {
    fontSize: FontSize.xxl + 2,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  attribution: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  formType: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: Spacing.md,
  },

  // Poem body
  poemBody: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  stanzaGap: {
    marginTop: Spacing.lg,
  },
  poemLine: {
    fontSize: FontSize.lg,
    fontFamily: 'serif',
    lineHeight: FontSize.lg * 1.75,
  },
  emptyBody: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.xxl,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: FontSize.sm,
  },

  // Timestamps
  timestamps: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    gap: 2,
  },
  timestampText: {
    fontSize: FontSize.xs,
  },

  // Source details
  sourceDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sourceDetailsText: {
    flex: 1,
    gap: 2,
  },
  sourceDetailLine: {
    fontSize: FontSize.sm,
  },

  // Actions
  actionsSection: {
    marginTop: Spacing.sm,
  },
  actionsTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  actionLabels: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  actionBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },

  // Bottom
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
