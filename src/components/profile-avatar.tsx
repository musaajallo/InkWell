/**
 * Profile Avatar
 *
 * Circular avatar shown in tab headers. Shows initials or user image.
 * Taps navigate to the profile screen.
 */

import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAuthStore } from '../stores/auth-store';
import { FontSize, BorderRadius } from '../constants/theme';

interface ProfileAvatarProps {
  size?: number;
}

export default function ProfileAvatar({ size = 32 }: ProfileAvatarProps) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);

  const handlePress = () => {
    router.push('/profile');
  };

  if (!profile) return null;

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      {profile.avatarUrl ? (
        <Image source={{ uri: profile.avatarUrl }} style={[styles.image, avatarStyle]} />
      ) : (
        <View style={[styles.initialsContainer, avatarStyle, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {profile.initials}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
