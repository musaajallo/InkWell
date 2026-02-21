/**
 * Sign In Screen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useAuthStore } from '../src/stores/auth-store';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signInWithEmail);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password) return;
    const result = await signIn(email.trim(), password);
    if (result.success) {
      router.replace('/(tabs)');
    }
  }, [email, password, signIn, router]);

  const handleGoToSignUp = useCallback(() => {
    clearError();
    router.push('/sign-up');
  }, [clearError, router]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <View style={styles.branding}>
          <Feather name="feather" size={48} color={colors.secondary} />
          <Text style={[styles.appName, { color: colors.text }]}>InkWell</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your poetry, your voice.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.heading, { color: colors.text }]}>Welcome back</Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.error + '12' }]}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowPassword((p) => !p)}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSignIn}
            disabled={isLoading || !email.trim() || !password}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={handleGoToSignUp}>
            <Text style={[styles.linkText, { color: colors.secondary }]}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  // Branding
  branding: { alignItems: 'center', marginBottom: Spacing.xxl },
  appName: { fontSize: FontSize.xxxl, fontWeight: '700', fontFamily: 'serif', marginTop: Spacing.md },
  tagline: { fontSize: FontSize.md, marginTop: Spacing.xs },

  // Form
  form: { gap: Spacing.md },
  heading: { fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.xs },
  field: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '600' },
  input: {
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
  },
  passwordRow: { flexDirection: 'row', gap: Spacing.xs },
  passwordInput: { flex: 1 },
  eyeBtn: {
    width: 48, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center', justifyContent: 'center',
  },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm + 2, borderRadius: BorderRadius.md,
  },
  errorText: { fontSize: FontSize.sm, flex: 1 },

  // Button
  primaryBtn: {
    paddingVertical: Spacing.sm + 6, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700' },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.md },
  linkText: { fontSize: FontSize.md, fontWeight: '700' },
});
