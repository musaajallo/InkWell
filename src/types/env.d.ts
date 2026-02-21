/**
 * Ambient module declarations for packages whose types the editor TS server
 * cannot resolve via the bundler moduleResolution strategy.
 *
 * The real TypeScript compiler (tsc --noEmit) resolves all of these correctly.
 * These declarations exist solely to eliminate red squiggles in the editor.
 */

// expo-router ships types at build/index.d.ts but the root index.d.ts
// (which contains only /// <reference> directives) confuses some TS servers.
declare module 'expo-router' {
  import type { ComponentProps, ReactNode } from 'react';
  import type { TextProps } from 'react-native';

  // Stack
  interface StackScreenProps {
    name: string;
    options?: Record<string, unknown>;
  }
  interface StackComponent {
    (props: { screenOptions?: Record<string, unknown>; children?: ReactNode }): ReactNode;
    Screen: (props: StackScreenProps) => ReactNode;
  }
  export const Stack: StackComponent;

  // Tabs
  interface TabsScreenProps {
    name: string;
    options?: Record<string, unknown>;
  }
  interface TabsComponent {
    (props: { screenOptions?: Record<string, unknown>; children?: ReactNode }): ReactNode;
    Screen: (props: TabsScreenProps) => ReactNode;
  }
  export const Tabs: TabsComponent;

  // Navigation
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    canGoBack: () => boolean;
  };

  export function useLocalSearchParams<T extends Record<string, string>>(): T;
  export function useGlobalSearchParams<T extends Record<string, string>>(): T;
  export function useSegments(): string[];
  export function usePathname(): string;

  // Link
  interface LinkProps extends TextProps {
    href: string;
    asChild?: boolean;
    children?: ReactNode;
  }
  export function Link(props: LinkProps): ReactNode;

  export function Redirect(props: { href: string }): ReactNode;
}

// Expo environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  }
}

declare module 'expo-status-bar' {
  import type { ReactNode } from 'react';
  interface StatusBarProps {
    style?: 'auto' | 'inverted' | 'light' | 'dark';
    animated?: boolean;
    hidden?: boolean;
    networkActivityIndicatorVisible?: boolean;
    backgroundColor?: string;
    translucent?: boolean;
  }
  export function StatusBar(props: StatusBarProps): ReactNode;
}

declare module 'react-native-safe-area-context' {
  import type { ReactNode } from 'react';
  import type { ViewProps } from 'react-native';

  export function SafeAreaProvider(props: ViewProps & { children?: ReactNode }): ReactNode;
  export function SafeAreaView(props: ViewProps & { children?: ReactNode; edges?: string[] }): ReactNode;

  interface SafeAreaInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
  export function useSafeAreaInsets(): SafeAreaInsets;
}
