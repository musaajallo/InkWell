/**
 * InkWell Design System
 *
 * Color palette, typography, spacing, and sizing values
 * matching the requirements document (Section 9).
 */

export const Colors = {
  light: {
    primary: '#1A1A2E',
    secondary: '#E94560',
    tertiary: '#0F3460',
    background: '#FEFEFE',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    voiceActive: '#E94560',
    imported: '#8B5CF6',
  },
  dark: {
    primary: '#E94560',
    secondary: '#E94560',
    tertiary: '#0F3460',
    background: '#0D0D1A',
    surface: '#1A1A2E',
    text: '#F5F5F5',
    textSecondary: '#9CA3AF',
    border: '#2D2D3F',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    voiceActive: '#E94560',
    imported: '#8B5CF6',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
