import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, ActivityIndicator, View } from 'react-native';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useAuthStore } from '../src/stores/auth-store';
import { usePoemStore } from '../src/stores/poem-store';
import { useCollectionStore } from '../src/stores/collection-store';
import { useSettingsStore } from '../src/stores/settings-store';

// Suppress the non-critical keep-awake error in Expo Go
LogBox.ignoreLogs(['Unable to activate keep awake']);

/** Syncs Zustand stores with Supabase when a session is active. */
function useDataSync() {
  const session = useAuthStore((s) => s.session);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const fetchPoems = usePoemStore((s) => s.fetchFromServer);
  const fetchCollections = useCollectionStore((s) => s.fetchFromServer);
  const fetchSettings = useSettingsStore((s) => s.fetchFromServer);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized || !session?.user?.id) {
      hasSyncedRef.current = false;
      return;
    }

    // Only sync once per session (avoids re-fetching on every re-render)
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const userId = session.user.id;
    // Fire all fetches in parallel — they're independent
    fetchPoems(userId);
    fetchCollections(userId);
    fetchSettings(userId);
  }, [isInitialized, session?.user?.id, fetchPoems, fetchCollections, fetchSettings]);
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const { colors } = useAppTheme();

  // Sync data stores when user signs in
  useDataSync();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'sign-in' || segments[0] === 'sign-up';

    if (!session && !inAuthGroup) {
      // Not signed in and not on auth screen — redirect to sign-in
      router.replace('/sign-in');
    } else if (session && inAuthGroup) {
      // Signed in but on auth screen — redirect to tabs
      router.replace('/(tabs)');
    }
  }, [session, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutContent() {
  const { colors, isDark } = useAppTheme();
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="poem/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="collection/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="forms/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="import" options={{ headerShown: false }} />
        <Stack.Screen name="poem/[id]/review" options={{ headerShown: false }} />
        <Stack.Screen name="poem/[id]/recitation" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </AuthGate>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutContent />
    </SafeAreaProvider>
  );
}
