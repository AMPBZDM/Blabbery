import * as Speech from 'expo-speech';
import { useSettingsStore } from '@/store/useSettingsStore';

export const appSpeech = {
  speak: (
    text: string,
    onDone?: () => void,
    onError?: (error: Error) => void
  ) => {
    Speech.stop();
    const rate = useSettingsStore.getState().settings.ttsRate || 1.0;

    Speech.speak(text, {
      language: 'en-US',
      rate: rate,
      pitch: 1.05,
      onDone: () => onDone?.(),
      onStopped: () => onDone?.(),
      onError: (err) => {
        console.warn('TTS error:', err);
        onError?.(new Error(String(err)));
      },
    });
  },

  stop: () => {
    Speech.stop();
  },

  isSpeaking: async (): Promise<boolean> => {
    return await Speech.isSpeakingAsync();
  },
};
