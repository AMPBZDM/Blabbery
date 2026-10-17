export const Colors = {
  light: {
    // Primary brand colors (Indigo / Purple)
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primaryLight: '#EEF2FF',

    // Secondary & Accent colors
    secondary: '#0284C7',
    secondaryLight: '#F0F9FF',
    accent: '#D97706',
    accentLight: '#FEF3C7',

    // Semantic status colors
    success: '#16A34A',
    successLight: '#DCFCE7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',

    // Background & Surfaces
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardHover: '#F1F5F9',

    // Typography
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    // Word badge / Highlights
    wordBadgeBg: '#EEF2FF',
    wordBadgeBorder: '#C7D2FE',
    wordBadgeText: '#3730A3',

    // UI Components
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    inputBg: '#FFFFFF',
    inputBorder: '#CBD5E1',
    inputFocusBorder: '#4F46E5',
  },
  dark: {
    // Primary brand colors
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#1E1B4B',

    // Secondary & Accent colors
    secondary: '#38BDF8',
    secondaryLight: '#082F49',
    accent: '#FBBF24',
    accentLight: '#451A03',

    // Semantic status colors
    success: '#34D399',
    successLight: '#052E16',
    danger: '#F87171',
    dangerLight: '#450A0A',

    // Background & Surfaces
    background: '#090D16',
    card: '#131B2E',
    cardBorder: '#1E293B',
    cardHover: '#1A243B',

    // Typography
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Word badge / Highlights
    wordBadgeBg: '#1E1B4B',
    wordBadgeBorder: '#3730A3',
    wordBadgeText: '#C7D2FE',

    // UI Components
    tabBarBg: '#0F172A',
    tabBarBorder: '#1E293B',
    inputBg: '#131B2E',
    inputBorder: '#1E293B',
    inputFocusBorder: '#818CF8',
  },
} as const;

export type ThemeColors = Record<keyof typeof Colors.light, string>;

export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySemibold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  badge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
} as const;

export const MinTouchTarget = 48;
