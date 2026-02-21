import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

export default function StartWritingButton() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={() => router.push('/write')}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Feather name="feather" size={22} color="#FFFFFF" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Start Writing</Text>
          <Text style={styles.subtitle}>Begin a new poem</Text>
        </View>
      </View>
      <Feather name="arrow-right" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  textContainer: {
    gap: 2,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
