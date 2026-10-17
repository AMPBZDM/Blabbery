import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useStoryStore } from '@/store/useStoryStore';
import { appSpeech } from '@/services/speech';
import { appHaptics } from '@/utils/haptics';
import {
  Moon,
  Sun,
  Smartphone,
  Type,
  Vibrate,
  Volume2,
  Lightbulb,
  ShieldCheck,
  Info,
  Trash2,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, fontSizeMultiplier } = useTheme();

  const settings = useSettingsStore((s) => s.settings);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setFontSizeMultiplier = useSettingsStore((s) => s.setFontSizeMultiplier);
  const setHapticEnabled = useSettingsStore((s) => s.setHapticEnabled);
  const setTtsRate = useSettingsStore((s) => s.setTtsRate);
  const setShowWordSuggestions = useSettingsStore((s) => s.setShowWordSuggestions);

  const clearAllCompleted = useStoryStore((s) => s.clearAllCompleted);

  const [isSpeakingTest, setIsSpeakingTest] = useState(false);

  const handleTestTTS = () => {
    appHaptics.light();
    if (isSpeakingTest) {
      appSpeech.stop();
      setIsSpeakingTest(false);
      return;
    }

    setIsSpeakingTest(true);
    appSpeech.speak(
      'Hello! This is a test read-aloud in the Blabbery app. The words are ready for an adventure!',
      () => setIsSpeakingTest(false),
      () => setIsSpeakingTest(false)
    );
  };

  const handleResetData = () => {
    appHaptics.medium();
    Alert.alert(
      'Delete Data',
      'Are you sure you want to delete all completed stories? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearAllCompleted();
            appHaptics.success();
            Alert.alert('Successfully Deleted', 'Your saved stories have been deleted.');
          },
        },
      ]
    );
  };

  const showPrivacyPolicy = () => {
    appHaptics.light();
    Alert.alert(
      'Privacy Policy',
      'The Blabbery app places the highest value on your privacy:\n\n' +
        '• 100% Offline: No user data is ever sent to external servers.\n' +
        '• No registration or account: The app is immediately ready to use.\n' +
        '• No tracking or ads: Zero third-party analytics or advertising SDKs.\n' +
        '• Local storage: All completed stories are stored exclusively on your device.\n\n' +
        'This design fully complies with strict privacy standards (GDPR).'
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: colors.text, fontSize: 26 * fontSizeMultiplier },
            ]}
          >
            Settings
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier },
            ]}
          >
            Customize your gameplay experience and appearance.
          </Text>
        </View>

        {/* 1. Theme Selector */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: colors.text, fontSize: 16 * fontSizeMultiplier },
            ]}
          >
            Appearance (Theme)
          </Text>

          <View style={styles.themeOptions}>
            {[
              { id: 'system', label: 'System', icon: Smartphone },
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
            ].map((item) => {
              const isSelected = settings.themeMode === item.id;
              const IconComp = item.icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    appHaptics.selection();
                    setThemeMode(item.id as any);
                  }}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.cardHover,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.cardBorder,
                    },
                  ]}
                >
                  <IconComp
                    size={18}
                    color={isSelected ? '#FFFFFF' : colors.text}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontSize: 12 * fontSizeMultiplier,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 2. Font Size Selector */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Type size={18} color={colors.primary} />
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text, fontSize: 16 * fontSizeMultiplier },
              ]}
            >
              Font Size (Reading)
            </Text>
          </View>

          <View style={styles.sizeOptions}>
            {[
              { multiplier: 0.9, label: 'Small' },
              { multiplier: 1.0, label: 'Normal' },
              { multiplier: 1.18, label: 'Large' },
            ].map((item) => {
              const isSelected = settings.fontSizeMultiplier === item.multiplier;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => {
                    appHaptics.selection();
                    setFontSizeMultiplier(item.multiplier);
                  }}
                  style={[
                    styles.sizeButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.cardHover,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeBtnText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontSize: 13 * item.multiplier,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.previewBox,
              { backgroundColor: colors.background, borderColor: colors.cardBorder },
            ]}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 15 * fontSizeMultiplier,
                textAlign: 'center',
              }}
            >
              “Sample text with the new font size.”
            </Text>
          </View>
        </View>

        {/* 3. Word Input Suggestions (Ideas and Examples) */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Lightbulb size={20} color={colors.primary} />
              <View style={{ flex: 1, paddingRight: Spacing.sm }}>
                <Text
                  style={[
                    styles.settingTitle,
                    { color: colors.text, fontSize: 15 * fontSizeMultiplier },
                  ]}
                >
                  Show Suggestions & Ideas
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    {
                      color: colors.textSecondary,
                      fontSize: 12 * fontSizeMultiplier,
                    },
                  ]}
                >
                  Quick ideas, example words, and random word generator during gameplay
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showWordSuggestions}
              onValueChange={(val) => {
                appHaptics.selection();
                setShowWordSuggestions(val);
              }}
              trackColor={{ false: colors.cardBorder, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 4. Haptics and Text-To-Speech (TTS) */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Vibrate size={20} color={colors.primary} />
              <View>
                <Text
                  style={[
                    styles.settingTitle,
                    { color: colors.text, fontSize: 15 * fontSizeMultiplier },
                  ]}
                >
                  Haptic Feedback
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    {
                      color: colors.textSecondary,
                      fontSize: 12 * fontSizeMultiplier,
                    },
                  ]}
                >
                  Subtle vibrations on typing and button presses
                </Text>
              </View>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(val) => {
                appHaptics.selection();
                setHapticEnabled(val);
              }}
              trackColor={{ false: colors.cardBorder, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.settingRow,
              { borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: Spacing.md },
            ]}
          >
            <View style={styles.settingLeft}>
              <Volume2 size={20} color={colors.primary} />
              <View>
                <Text
                  style={[
                    styles.settingTitle,
                    { color: colors.text, fontSize: 15 * fontSizeMultiplier },
                  ]}
                >
                  Speech Read-Aloud (TTS Test)
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    {
                      color: colors.textSecondary,
                      fontSize: 12 * fontSizeMultiplier,
                    },
                  ]}
                >
                  Built-in voice speech synthesizer
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleTestTTS}
              style={[
                styles.ttsTestBtn,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.ttsTestBtnText,
                  { color: colors.primary, fontSize: 12 * fontSizeMultiplier },
                ]}
              >
                {isSpeakingTest ? 'Stop' : 'Test'}
              </Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
            {[
              { rate: 0.8, label: '0.8x Slow' },
              { rate: 1.0, label: '1.0x Normal' },
              { rate: 1.2, label: '1.2x Fast' },
            ].map((item) => {
              const isSelected = settings.ttsRate === item.rate;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => {
                    appHaptics.selection();
                    setTtsRate(item.rate);
                  }}
                  style={[
                    styles.sizeButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.cardHover,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeBtnText,
                      { color: isSelected ? '#FFFFFF' : colors.text, fontSize: 12 },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 5. Privacy and About */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Pressable onPress={showPrivacyPolicy} style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <ShieldCheck size={20} color={colors.accent} />
              <Text
                style={[
                  styles.infoTitle,
                  { color: colors.text, fontSize: 15 * fontSizeMultiplier },
                ]}
              >
                Privacy & Security (100% Offline)
              </Text>
            </View>
            <Text style={[styles.infoLink, { color: colors.primary }]}>
              Details
            </Text>
          </Pressable>

          <View
            style={[
              styles.infoRow,
              { borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: Spacing.md },
            ]}
          >
            <View style={styles.infoLeft}>
              <Info size={20} color={colors.textMuted} />
              <Text
                style={[
                  styles.infoTitle,
                  { color: colors.text, fontSize: 15 * fontSizeMultiplier },
                ]}
              >
                App Version
              </Text>
            </View>
            <Text style={[styles.infoBadge, { color: colors.textMuted }]}>
              v1.0.0 (Build 1)
            </Text>
          </View>
        </View>

        {/* 6. Danger Zone: Reset Data */}
        <Pressable
          onPress={handleResetData}
          style={[
            styles.resetBtn,
            { backgroundColor: colors.card, borderColor: colors.danger },
          ]}
        >
          <Trash2 size={18} color={colors.danger} />
          <Text
            style={[
              styles.resetBtnText,
              { color: colors.danger, fontSize: 14 * fontSizeMultiplier },
            ]}
          >
            Delete All Saved Stories
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  themeBtnText: {
    fontWeight: '700',
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sizeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sizeBtnText: {
    fontWeight: '700',
  },
  previewBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  settingTitle: {
    fontWeight: '700',
  },
  settingSubtitle: {
    marginTop: 2,
  },
  ttsTestBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  ttsTestBtnText: {
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  infoTitle: {
    fontWeight: '600',
  },
  infoLink: {
    fontWeight: '700',
  },
  infoBadge: {
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.sm,
  },
  resetBtnText: {
    fontWeight: '800',
  },
});
