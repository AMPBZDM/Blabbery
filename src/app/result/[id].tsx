import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useStoryStore } from '@/store/useStoryStore';
import { DEFAULT_STORIES } from '@/data/defaultStories';
import { parseStorySegments } from '@/services/engine/templateParser';
import { StoryReader } from '@/components/story/StoryReader';
import { ShareCardView } from '@/components/story/ShareCardView';
import { AppButton } from '@/components/common/Button';
import { appSpeech } from '@/services/speech';
import { appShare } from '@/services/share';
import { appHaptics } from '@/utils/haptics';
import {
  Heart,
  Share2,
  Copy,
  Check,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  RotateCcw,
  Home,
  Sparkles,
} from 'lucide-react-native';

const EMPTY_FAVORITE_TEMPLATES: string[] = [];

export default function StoryResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontSizeMultiplier } = useTheme();

  const completedStories = useStoryStore((s) => s.completedStories);
  const toggleFavorite = useStoryStore((s) => s.toggleFavorite);
  const clearDraft = useStoryStore((s) => s.clearDraft);
  const saveDraft = useStoryStore((s) => s.saveDraft);
  const favoriteTemplateIds =
    useStoryStore((s) => s.favoriteTemplateIds) ?? EMPTY_FAVORITE_TEMPLATES;
  const toggleFavoriteTemplate = useStoryStore((s) => s.toggleFavoriteTemplate);

  const story = completedStories.find((s) => s.id === id);
  const template = story
    ? DEFAULT_STORIES.find((t) => t.id === story.templateId)
    : undefined;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const shareCardRef = useRef<View>(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      appSpeech.stop();
    };
  }, []);

  if (!story || !template) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            The requested story was not found.
          </Text>
          <AppButton
            title="Back to Home"
            onPress={() => router.replace('/(tabs)')}
            icon={<Home size={18} color="#FFFFFF" />}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isTemplateFavorite = favoriteTemplateIds.includes(template.id);

  // Break down text segments and words using the generator engine
  const segments = parseStorySegments(
    template.templateText,
    story.userWords,
    template.prompts
  );

  // Toggle favorite for completed story result
  const handleToggleFavorite = () => {
    appHaptics.light();
    toggleFavorite(story.id);
  };

  // Add / remove original story template to favorites
  const handleToggleTemplateFavorite = () => {
    appHaptics.selection();
    toggleFavoriteTemplate(template.id);
    const willBeFav = !favoriteTemplateIds.includes(template.id);
    Alert.alert(
      willBeFav ? 'Added to favorites!' : 'Removed from favorites',
      willBeFav
        ? `"${template.title}" was added to your favorite templates.`
        : `"${template.title}" was removed from your favorite templates.`
    );
  };

  // Toggle text-to-speech
  const handleToggleSpeech = () => {
    appHaptics.medium();
    if (isSpeaking) {
      appSpeech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      appSpeech.speak(
        `${story.title}. ${story.assembledText}`,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  // Share full story via native share sheet
  const handleShareText = async () => {
    appHaptics.light();
    const result = await appShare.shareText(story.title, story.assembledText);
    if (!result.success && result.message && result.message !== 'Share cancelled.') {
      Alert.alert('Share', result.message);
    }
  };

  // Copy story text to clipboard
  const handleCopyText = async () => {
    appHaptics.medium();
    const result = await appShare.copyToClipboard(story.title, story.assembledText);
    if (result.success) {
      setIsCopied(true);
      appHaptics.success();
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      Alert.alert('Copy Error', result.message || 'Could not copy story to clipboard.');
    }
  };

  // Export and share image
  const handleShareImage = async () => {
    if (!shareCardRef.current) return;
    try {
      appHaptics.medium();
      setIsCapturing(true);

      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });

      const result = await appShare.shareImage(uri);
      if (!result.success && result.message) {
        Alert.alert('Image Share', result.message);
      }
    } catch (err: any) {
      console.warn('Capture error:', err);
      Alert.alert('Error', 'Failed to generate image.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Restart story from beginning with current words
  const handleRestart = () => {
    appHaptics.medium();
    Alert.alert(
      'Restart Story',
      'Would you like to review or fill this story again from step 1 with the current words?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          onPress: () => {
            saveDraft({
              templateId: template.id,
              currentStepIndex: 0,
              enteredWords: { ...story.userWords },
              updatedAt: new Date().toISOString(),
            });
            router.replace({
              pathname: '/story/[id]',
              params: { id: template.id },
            });
          },
        },
      ]
    );
  };

  // Replay story with fresh, blank words
  const handleReplayNewWords = () => {
    appHaptics.medium();
    Alert.alert(
      'Play with New Words',
      'Would you like to play this story again with fresh, blank words?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start New Game',
          onPress: () => {
            clearDraft(template.id);
            router.replace({
              pathname: '/story/[id]',
              params: { id: template.id },
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          style={styles.navButton}
        >
          <Home size={22} color={colors.text} />
        </Pressable>

        <Text
          style={[
            styles.navTitle,
            { color: colors.text, fontSize: 16 * fontSizeMultiplier },
          ]}
        >
          Completed Story
        </Text>

        <Pressable
          onPress={handleToggleFavorite}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            story.isFavorite
              ? 'Remove story from favorites'
              : 'Add story to favorites'
          }
          style={styles.navButton}
        >
          <Heart
            size={22}
            color={story.isFavorite ? colors.danger : colors.textMuted}
            fill={story.isFavorite ? colors.danger : 'transparent'}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration header */}
        <View style={styles.heroHeader}>
          <View
            style={[
              styles.sparkleWrap,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Sparkles size={28} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.celebrationText,
              { color: colors.primary, fontSize: 13 * fontSizeMultiplier },
            ]}
          >
            YOUR MASTERPIECE IS READY!
          </Text>
          <Text
            style={[
              styles.title,
              { color: colors.text, fontSize: 24 * fontSizeMultiplier },
            ]}
          >
            {story.title}
          </Text>
          <Text
            style={[
              styles.hint,
              { color: colors.textSecondary, fontSize: 13 * fontSizeMultiplier },
            ]}
          >
            Tap any highlighted word to inspect its prompt category!
          </Text>
        </View>

        {/* Copy feedback banner (when recently copied to clipboard) */}
        {isCopied && (
          <View
            style={[
              styles.copiedBanner,
              {
                backgroundColor: colors.successLight,
                borderColor: colors.success,
              },
            ]}
          >
            <Check size={18} color={colors.success} />
            <Text
              style={[
                styles.copiedBannerText,
                { color: colors.success, fontSize: 13 * fontSizeMultiplier },
              ]}
            >
              Story title and text copied to clipboard! 📋
            </Text>
          </View>
        )}

        {/* Formatted story reader */}
        <StoryReader segments={segments} />

        {/* Action section */}
        <View style={styles.actionSection}>
          {/* 1. Text-to-speech button */}
          <AppButton
            title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            onPress={handleToggleSpeech}
            variant="primary"
            size="lg"
            icon={
              isSpeaking ? (
                <VolumeX size={20} color="#FFFFFF" />
              ) : (
                <Volume2 size={20} color="#FFFFFF" />
              )
            }
            style={styles.mainActionBtn}
          />

          {/* 2. Share and Copy buttons */}
          <View style={styles.buttonRow}>
            <AppButton
              title="Share"
              onPress={handleShareText}
              variant="outline"
              icon={<Share2 size={16} color={colors.text} />}
              style={styles.halfBtn}
            />

            <AppButton
              title={isCopied ? 'Copied!' : 'Copy'}
              onPress={handleCopyText}
              variant={isCopied ? 'primary' : 'outline'}
              icon={
                isCopied ? (
                  <Check size={16} color="#FFFFFF" />
                ) : (
                  <Copy size={16} color={colors.text} />
                )
              }
              style={styles.halfBtn}
            />
          </View>

          {/* 3. Export image and Favorite template buttons */}
          <View style={styles.buttonRow}>
            <AppButton
              title="Export Image"
              onPress={handleShareImage}
              variant="outline"
              loading={isCapturing}
              icon={<ImageIcon size={16} color={colors.text} />}
              style={styles.halfBtn}
            />

            <AppButton
              title={isTemplateFavorite ? 'Template Saved' : 'Favorite Template'}
              onPress={handleToggleTemplateFavorite}
              variant={isTemplateFavorite ? 'secondary' : 'outline'}
              icon={
                <Heart
                  size={16}
                  color={isTemplateFavorite ? colors.danger : colors.text}
                  fill={isTemplateFavorite ? colors.danger : 'transparent'}
                />
              }
              style={styles.halfBtn}
            />
          </View>

          {/* 4. Restart or Replay buttons */}
          <View style={styles.buttonRow}>
            <AppButton
              title="Restart"
              onPress={handleRestart}
              variant="outline"
              icon={<RotateCcw size={16} color={colors.text} />}
              style={styles.halfBtn}
            />

            <AppButton
              title="New Words"
              onPress={handleReplayNewWords}
              variant="secondary"
              icon={<Sparkles size={16} color={colors.text} />}
              style={styles.halfBtn}
            />
          </View>

          {/* 5. Back to Home button */}
          <AppButton
            title="Back to Home"
            onPress={() => router.replace('/(tabs)')}
            variant="ghost"
            icon={<Home size={18} color={colors.textSecondary} />}
            textStyle={{ color: colors.textSecondary }}
            style={styles.homeBtn}
          />
        </View>

        {/* Hidden card for image export (Offscreen view-shot render) */}
        <View style={styles.offscreenCardWrap}>
          <ShareCardView
            ref={shareCardRef}
            title={story.title}
            assembledText={story.assembledText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroHeader: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  sparkleWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  celebrationText: {
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  hint: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  copiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  copiedBannerText: {
    fontWeight: '700',
    flex: 1,
  },
  actionSection: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  mainActionBtn: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
  homeBtn: {
    marginTop: Spacing.xs,
  },
  offscreenCardWrap: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
