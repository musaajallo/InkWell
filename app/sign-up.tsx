/**
 * Sign Up Screen
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useAuthStore } from '../src/stores/auth-store';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function SignUpScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUpWithEmail);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = useCallback(async () => {
    if (!email.trim() || !password) return;

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    const result = await signUp(email.trim(), password, displayName.trim() || undefined);
    if (result.success) {
      Alert.alert(
        'Check Your Email',
        'We sent a confirmation link to your email. Please verify before signing in.',
        [{ text: 'OK', onPress: () => router.replace('/sign-in') }]
      );
    }
  }, [email, password, confirmPassword, displayName, signUp, router]);

  const handleGoToSignIn = useCallback(() => {
    clearError();
    router.back();
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
          <Feather name="feather" size={40} color={colors.secondary} />
          <Text style={[styles.appName, { color: colors.text }]}>Join InkWell</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.heading, { color: colors.text }]}>Create your account</Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.error + '12' }]}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              placeholder="Your pen name"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

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
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowPassword((p) => !p)}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              placeholder="Re-enter password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSignUp}
            disabled={isLoading || !email.trim() || !password}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={handleGoToSignIn}>
            <Text style={[styles.linkText, { color: colors.secondary }]}> Sign In</Text>
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

  branding: { alignItems: 'center', marginBottom: Spacing.xl },
  appName: { fontSize: FontSize.xxl, fontWeight: '700', fontFamily: 'serif', marginTop: Spacing.sm },

  form: { gap: Spacing.md },
  heading: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.xs },
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

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm + 2, borderRadius: BorderRadius.md,
  },
  errorText: { fontSize: FontSize.sm, flex: 1 },

  primaryBtn: {
    paddingVertical: Spacing.sm + 6, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.md },
  linkText: { fontSize: FontSize.md, fontWeight: '700' },
});
