import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/useSettingsStore';

export const appHaptics = {
  light: () => {
    if (useSettingsStore.getState().settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  },
  medium: () => {
    if (useSettingsStore.getState().settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  },
  heavy: () => {
    if (useSettingsStore.getState().settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  },
  selection: () => {
    if (useSettingsStore.getState().settings.hapticEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
  },
  success: () => {
    if (useSettingsStore.getState().settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  },
};
