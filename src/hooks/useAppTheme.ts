/**
 * useAppTheme
 *
 * Returns the current theme colors, respecting the user's preference
 * from the settings store (light / dark / system).
 */

import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { useSettingsStore } from '../stores/settings-store';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const themePref = useSettingsStore((s) => s.settings.theme);

  const isDark =
    themePref === 'dark'
      ? true
      : themePref === 'light'
        ? false
        : systemScheme === 'dark';

  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
  };
}
