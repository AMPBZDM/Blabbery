import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors, ThemeColors } from '@/constants/theme';
import { useSettingsStore } from '@/store/useSettingsStore';

export function useTheme(): {
  colors: ThemeColors;
  isDark: boolean;
  fontSizeMultiplier: number;
} {
  const systemScheme = useRNColorScheme();
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const fontSizeMultiplier = useSettingsStore(
    (s) => s.settings.fontSizeMultiplier
  );

  let activeTheme: 'light' | 'dark' = 'light';

  if (themeMode === 'system') {
    activeTheme = systemScheme === 'dark' ? 'dark' : 'light';
  } else {
    activeTheme = themeMode;
  }

  return {
    colors: Colors[activeTheme],
    isDark: activeTheme === 'dark',
    fontSizeMultiplier: fontSizeMultiplier || 1.0,
  };
}
