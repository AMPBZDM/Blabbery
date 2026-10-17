import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { DEFAULT_STORIES } from '@/data/defaultStories';
import { StoryTemplate } from '@/types/story';
import { useStoryStore } from '@/store/useStoryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ProgressBar } from '@/components/story/ProgressBar';
import { WordInputCard } from '@/components/story/WordInputCard';
import { WordReviewView } from '@/components/story/WordReviewView';
import { AppButton } from '@/components/common/Button';
import { generateCompletedStory } from '@/services/engine/storyGenerator';
import {
  validateWordInput,
  validateAllWords,
} from '@/services/engine/wordInputValidator';
import { appHaptics } from '@/utils/haptics';
import { ArrowLeft, ArrowRight, Sparkles, X, CheckCheck } from 'lucide-react-native';

interface StoryInputSessionProps {
  template: StoryTemplate;
}

function StoryInputSession({ template }: StoryInputSessionProps) {
  const router = useRouter();
  const { colors, fontSizeMultiplier } = useTheme();

  const drafts = useStoryStore((s) => s.drafts);
  const saveDraft = useStoryStore((s) => s.saveDraft);
  const clearDraft = useStoryStore((s) => s.clearDraft);
  const addCompletedStory = useStoryStore((s) => s.addCompletedStory);
  const showWordSuggestions = useSettingsStore(
    (s) => s.settings.showWordSuggestions ?? false
  );

  // Initialize state from existing draft or clean slate
  const existingDraft = drafts[template.id];

  const [currentStepIndex, setCurrentStepIndex] = useState(
    existingDraft
      ? Math.min(existingDraft.currentStepIndex, (template.prompts.length || 1) - 1)
      : 0
  );

  const [enteredWords, setEnteredWords] = useState<Record<string, string>>(
    existingDraft ? existingDraft.enteredWords : {}
  );

  const [isReviewMode, setIsReviewMode] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  const currentPrompt = template.prompts[currentStepIndex];
  const isLastStep = currentStepIndex === template.prompts.length - 1;
  const currentWordValue = enteredWords[currentPrompt?.id] || '';

  // Auto-save draft on word change
  const handleWordChange = (text: string) => {
    if (validationError) {
      setValidationError(undefined);
    }

    const updated = {
      ...enteredWords,
      [currentPrompt.id]: text,
    };
    setEnteredWords(updated);

    saveDraft({
      templateId: template.id,
      currentStepIndex,
      enteredWords: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Advance to next step with validation
  const handleNext = () => {
    const isRequired = currentPrompt.isRequired !== false;
    const validation = validateWordInput(currentWordValue, isRequired);

    if (!validation.isValid) {
      appHaptics.medium();
      setValidationError(validation.errorMessage);
      return;
    }

    setValidationError(undefined);

    const finalWords = {
      ...enteredWords,
      [currentPrompt.id]: validation.normalized,
    };
    setEnteredWords(finalWords);

    if (isLastStep) {
      // Transition to review view after the final word
      appHaptics.success();
      setIsReviewMode(true);

      saveDraft({
        templateId: template.id,
        currentStepIndex,
        enteredWords: finalWords,
        updatedAt: new Date().toISOString(),
      });
    } else {
      appHaptics.light();
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      saveDraft({
        templateId: template.id,
        currentStepIndex: nextIndex,
        enteredWords: finalWords,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Return to previous prompt or return from review to last word
  const handlePrevious = () => {
    appHaptics.light();
    setValidationError(undefined);

    if (isReviewMode) {
      setIsReviewMode(false);
      setCurrentStepIndex(template.prompts.length - 1);
      return;
    }

    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);

      saveDraft({
        templateId: template.id,
        currentStepIndex: prevIndex,
        enteredWords,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Jump directly to edit a specific step from review mode
  const handleEditStepFromReview = (stepIndex: number) => {
    appHaptics.selection();
    setIsReviewMode(false);
    setCurrentStepIndex(stepIndex);
    setValidationError(undefined);
  };

  // Final story reveal with full validation
  const handleFinishStory = () => {
    const validation = validateAllWords(template.prompts, enteredWords);

    if (!validation.isValid) {
      appHaptics.medium();
      Alert.alert(
        'Missing Fields',
        'Please fill in all required words before revealing the story!',
        [
          {
            text: 'Fill in',
            onPress: () => {
              setIsReviewMode(false);
              setCurrentStepIndex(validation.firstInvalidIndex);
              setValidationError('This word is required!');
            },
          },
        ]
      );
      return;
    }

    // Successful completion: assemble and persist with generator engine
    appHaptics.success();
    const generated = generateCompletedStory(
      template,
      validation.normalizedWords
    );
    const storyId = `story-${Date.now()}`;

    addCompletedStory({
      id: storyId,
      templateId: template.id,
      title: template.title,
      category: template.category,
      completedAt: new Date().toISOString(),
      userWords: validation.normalizedWords,
      assembledText: generated.assembledText,
      isFavorite: false,
    });

    clearDraft(template.id);

    router.replace({
      pathname: '/result/[id]',
      params: { id: storyId },
    });
  };

  // Exit with confirmation alert while preserving draft
  const handleExit = () => {
    appHaptics.light();
    const filledCount = Object.values(enteredWords).filter(
      (w) => typeof w === 'string' && w.trim().length > 0
    ).length;

    const navigateBackSafely = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    };

    if (filledCount > 0) {
      Alert.alert(
        'Exit Game',
        'Your entered words have been saved as a draft, so you can resume anytime.',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Exit',
            onPress: navigateBackSafely,
          },
        ]
      );
    } else {
      navigateBackSafely();
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top control bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={handleExit}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Exit to home"
            style={styles.closeBtn}
          >
            <X size={24} color={colors.text} />
          </Pressable>

          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.storyTitle,
                { color: colors.text, fontSize: 16 * fontSizeMultiplier },
              ]}
              numberOfLines={1}
            >
              {isReviewMode ? 'Review & Confirm' : template.title}
            </Text>
          </View>

          <View style={{ width: 32 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <ProgressBar
            currentStep={currentStepIndex}
            totalSteps={template.prompts.length}
            isReview={isReviewMode}
          />
        </View>

        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {isReviewMode ? (
            <WordReviewView
              prompts={template.prompts}
              enteredWords={enteredWords}
              onEditStep={handleEditStepFromReview}
            />
          ) : (
            <WordInputCard
              prompt={currentPrompt}
              value={currentWordValue}
              errorMessage={validationError}
              onChangeText={handleWordChange}
              onSubmit={handleNext}
              isLast={isLastStep}
              showSuggestions={showWordSuggestions}
            />
          )}
        </ScrollView>

        {/* Bottom action buttons */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.cardBorder,
            },
          ]}
        >
          <AppButton
            title={isReviewMode ? 'Back' : 'Previous'}
            onPress={handlePrevious}
            variant="outline"
            disabled={!isReviewMode && currentStepIndex === 0}
            icon={<ArrowLeft size={16} color={colors.text} />}
            style={styles.prevBtn}
          />

          {isReviewMode ? (
            <AppButton
              title="🎉 Reveal Story!"
              onPress={handleFinishStory}
              variant="primary"
              icon={<Sparkles size={17} color="#FFFFFF" />}
              iconPosition="right"
              style={styles.nextBtn}
            />
          ) : (
            <AppButton
              title={isLastStep ? 'Review' : 'Next'}
              onPress={handleNext}
              variant="primary"
              icon={
                isLastStep ? (
                  <CheckCheck size={16} color="#FFFFFF" />
                ) : (
                  <ArrowRight size={16} color="#FFFFFF" />
                )
              }
              iconPosition="right"
              style={styles.nextBtn}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function StoryInputScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const template = DEFAULT_STORIES.find((s) => s.id === id);

  if (!template) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            The requested story was not found.
          </Text>
          <AppButton
            title="Back to Home"
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return <StoryInputSession key={template.id} template={template} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  storyTitle: {
    fontWeight: '800',
  },
  progressWrap: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
    borderTopWidth: 1,
  },
  prevBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
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
