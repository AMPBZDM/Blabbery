import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types/story';

export interface SettingsState {
  settings: AppSettings;
  setThemeMode: (mode: AppSettings['themeMode']) => void;
  setFontSizeMultiplier: (multiplier: number) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setTtsRate: (rate: number) => void;
  setShowWordSuggestions: (enabled: boolean) => void;
  resetSettings: () => void;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  fontSizeMultiplier: 1.0,
  hapticEnabled: true,
  ttsRate: 1.0,
  showWordSuggestions: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setThemeMode: (themeMode) =>
        set((state) => ({ settings: { ...state.settings, themeMode } })),
      setFontSizeMultiplier: (fontSizeMultiplier) =>
        set((state) => ({ settings: { ...state.settings, fontSizeMultiplier } })),
      setHapticEnabled: (hapticEnabled) =>
        set((state) => ({ settings: { ...state.settings, hapticEnabled } })),
      setTtsRate: (ttsRate) =>
        set((state) => ({ settings: { ...state.settings, ttsRate } })),
      setShowWordSuggestions: (showWordSuggestions) =>
        set((state) => ({ settings: { ...state.settings, showWordSuggestions } })),
      resetSettings: () =>
        set(() => ({ settings: DEFAULT_SETTINGS })),
    }),
    {
      name: 'blabbery-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Safely sanitize corrupted or missing settings
      merge: (persistedState: any, currentState: SettingsState): SettingsState => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }

        const s = persistedState.settings;
        const validTheme = ['system', 'light', 'dark'].includes(s?.themeMode)
          ? s.themeMode
          : DEFAULT_SETTINGS.themeMode;
        const validFontSize =
          typeof s?.fontSizeMultiplier === 'number' && s.fontSizeMultiplier > 0.5 && s.fontSizeMultiplier < 2.0
            ? s.fontSizeMultiplier
            : DEFAULT_SETTINGS.fontSizeMultiplier;
        const validHaptic =
          typeof s?.hapticEnabled === 'boolean'
            ? s.hapticEnabled
            : DEFAULT_SETTINGS.hapticEnabled;
        const validTts =
          typeof s?.ttsRate === 'number' && s.ttsRate >= 0.5 && s.ttsRate <= 2.0
            ? s.ttsRate
            : DEFAULT_SETTINGS.ttsRate;
        const validShowSuggestions =
          typeof s?.showWordSuggestions === 'boolean'
            ? s.showWordSuggestions
            : DEFAULT_SETTINGS.showWordSuggestions;

        return {
          ...currentState,
          settings: {
            themeMode: validTheme,
            fontSizeMultiplier: validFontSize,
            hapticEnabled: validHaptic,
            ttsRate: validTts,
            showWordSuggestions: validShowSuggestions,
          },
        };
      },
    }
  )
);
