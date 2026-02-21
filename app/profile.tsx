/**
 * User Profile Screen
 *
 * Displays user info, writing stats, and sign-out action.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useAuthStore } from '../src/stores/auth-store';
import { usePoemStore } from '../src/stores/poem-store';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const poems = usePoemStore((s) => s.poems);

  const stats = useMemo(() => {
    const total = poems.length;
    const drafts = poems.filter((p) => p.status === 'draft').length;
    const complete = poems.filter((p) => p.status === 'complete').length;
    const favorites = poems.filter((p) => p.isFavorite).length;
    const totalWords = poems.reduce((sum, p) => sum + p.wordCount, 0);
    return { total, drafts, complete, favorites, totalWords };
  }, [poems]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  }, [signOut, router]);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.avatarText}>{profile?.initials ?? '??'}</Text>
          </View>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {profile?.displayName ?? 'Poet'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {profile?.email ?? ''}
          </Text>
          {memberSince ? (
            <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
              Member since {memberSince}
            </Text>
          ) : null}
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Writing Stats</Text>
          <View style={styles.statsGrid}>
            <StatItem label="Poems" value={stats.total} color={colors.text} subColor={colors.textSecondary} />
            <StatItem label="Complete" value={stats.complete} color={colors.success} subColor={colors.textSecondary} />
            <StatItem label="Drafts" value={stats.drafts} color={colors.warning} subColor={colors.textSecondary} />
            <StatItem label="Favorites" value={stats.favorites} color={colors.secondary} subColor={colors.textSecondary} />
          </View>
          <View style={[styles.wordCountRow, { borderTopColor: colors.border }]}>
            <Feather name="type" size={16} color={colors.textSecondary} />
            <Text style={[styles.wordCountText, { color: colors.textSecondary }]}>
              {stats.totalWords.toLocaleString()} words written
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Feather name="settings" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Settings</Text>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { backgroundColor: colors.error + '08', borderColor: colors.error + '30' }]}
            onPress={handleSignOut}
          >
            <Feather name="log-out" size={20} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Sign Out</Text>
            <View style={{ width: 18 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-component ───────────────────────────────────────────

function StatItem({ label, value, color, subColor }: { label: string; value: number; color: string; subColor: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: subColor }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl + Spacing.sm, paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700' },

  scrollContent: { padding: Spacing.lg },

  // Profile
  profileSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: FontSize.xxl, fontWeight: '700' },
  displayName: { fontSize: FontSize.xxl, fontWeight: '700', marginTop: Spacing.md },
  email: { fontSize: FontSize.md, marginTop: Spacing.xs },
  memberSince: { fontSize: FontSize.sm, marginTop: Spacing.xs },

  // Stats
  statsCard: {
    borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  statsTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, marginTop: 2 },
  wordCountRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth,
  },
  wordCountText: { fontSize: FontSize.sm },

  // Actions
  actions: { gap: Spacing.sm },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
  },
  actionText: { fontSize: FontSize.md, fontWeight: '600', flex: 1 },
});
