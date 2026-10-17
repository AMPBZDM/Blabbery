import { describe, test, expect, beforeEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_STORIES } from '@/data/stories';
import { useStoryStore } from '@/store/useStoryStore';
import { useSettingsStore, DEFAULT_SETTINGS } from '@/store/useSettingsStore';
import { validateStoriesCollection } from '@/services/engine/storyValidator';
import {
  validateWordInput,
  validateAllWords,
  normalizeWord,
} from '@/services/engine/wordInputValidator';
import {
  generateCompletedStory,
  verifyNoRemainingPlaceholders,
  tokenizeStorySegments,
} from '@/services/engine/storyGenerator';
import { appShare } from '@/services/share';

describe('App Comprehensive Integration & Verification Suite', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStoryStore.getState().resetAllStoryData();
    useSettingsStore.getState().resetSettings();
  });

  describe('1. Story Templates & Placeholders Integrity', () => {
    test('validates all built-in stories without errors and ensures required fields', () => {
      expect(ALL_STORIES.length).toBeGreaterThanOrEqual(10);
      const collectionResult = validateStoriesCollection(ALL_STORIES);

      expect(collectionResult.invalidStories).toHaveLength(0);
      expect(collectionResult.duplicateIds).toHaveLength(0);
      expect(collectionResult.validStories.length).toBe(ALL_STORIES.length);
    });

    test('fills every template with sample words without unresolved placeholders', () => {
      for (const story of ALL_STORIES) {
        const dummyWords: Record<string, string> = {};
        for (const prompt of story.prompts) {
          dummyWords[prompt.id] = prompt.examples?.[0] || 'SampleWord';
        }

        const generated = generateCompletedStory(story, dummyWords);
        expect(generated.success).toBe(true);
        expect(generated.unresolvedPlaceholders).toHaveLength(0);

        const check = verifyNoRemainingPlaceholders(generated.assembledText);
        expect(check.hasPlaceholders).toBe(false);
        expect(check.placeholders).toHaveLength(0);

        const segments = tokenizeStorySegments(story.templateText, dummyWords, story.prompts);
        expect(segments.length).toBeGreaterThan(0);
      }
    });
  });

  describe('2. Word Input Validation & International Character Support', () => {
    test('preserves accented words, punctuation, and casing', () => {
      const internationalInputs = [
        'Reykjavík',
        'São Paulo',
        'München',
        'Renée Dupont',
        'crème brûlée',
        'super-cool',
      ];

      for (const input of internationalInputs) {
        const result = validateWordInput(input, true);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe(input);
      }
    });

    test('normalizes extra whitespace and handles empty inputs', () => {
      expect(normalizeWord('   cheesecake   ')).toBe('cheesecake');
      expect(normalizeWord('wonderful    tasty   lunch')).toBe('wonderful tasty lunch');
      expect(validateWordInput('    ', true).isValid).toBe(false);
      expect(validateWordInput('', false).isValid).toBe(true);
    });

    test('strictly enforces character length limit (MAX_WORD_LENGTH = 50)', () => {
      const exactly50 = 'a'.repeat(50);
      const tooLong51 = 'a'.repeat(51);

      expect(validateWordInput(exactly50, true).isValid).toBe(true);
      expect(validateWordInput(tooLong51, true).isValid).toBe(false);
    });

    test('validateAllWords checks for missing required fields and reports first invalid index', () => {
      const testStory = ALL_STORIES[0];
      const partialWords: Record<string, string> = {};
      partialWords[testStory.prompts[0].id] = 'First';

      const validation = validateAllWords(testStory.prompts, partialWords);
      expect(validation.isValid).toBe(false);
      expect(validation.firstInvalidIndex).toBe(1);
      expect(validation.missingPromptIds).toContain(testStory.prompts[1].id);
    });
  });

  describe('3. Full Gameplay & Storage Flow', () => {
    test('saves draft, updates it, generates story, and clears draft on completion', () => {
      const storyTemplate = ALL_STORIES[0];

      // 1. Save draft step by step
      useStoryStore.getState().saveDraft({
        templateId: storyTemplate.id,
        currentStepIndex: 1,
        enteredWords: { [storyTemplate.prompts[0].id]: 'Peter' },
        updatedAt: new Date().toISOString(),
      });

      let state = useStoryStore.getState();
      expect(state.drafts[storyTemplate.id]).toBeDefined();
      expect(state.drafts[storyTemplate.id].enteredWords[storyTemplate.prompts[0].id]).toBe('Peter');
      expect(state.recentPlayedTemplateIds[0]).toBe(storyTemplate.id);

      // 2. Finish story
      const completedWords: Record<string, string> = {};
      for (const p of storyTemplate.prompts) {
        completedWords[p.id] = p.examples?.[0] || 'Sample';
      }

      const generated = generateCompletedStory(storyTemplate, completedWords);
      const storyId = 'story-test-123';

      useStoryStore.getState().addCompletedStory({
        id: storyId,
        templateId: storyTemplate.id,
        title: storyTemplate.title,
        category: storyTemplate.category,
        completedAt: new Date().toISOString(),
        userWords: completedWords,
        assembledText: generated.assembledText,
        isFavorite: false,
      });

      state = useStoryStore.getState();
      // Draft is automatically cleared on story completion
      expect(state.drafts[storyTemplate.id]).toBeUndefined();
      expect(state.completedStories).toHaveLength(1);
      expect(state.completedStories[0].id).toBe(storyId);
      expect(state.completedStories[0].title).toBe(storyTemplate.title);
    });

    test('toggles favorite template and favorite completed story independently', () => {
      const templateId = ALL_STORIES[0].id;
      const storyId = 'completed-xyz';

      useStoryStore.getState().addCompletedStory({
        id: storyId,
        templateId,
        title: 'Title',
        category: 'funny',
        completedAt: new Date().toISOString(),
        userWords: {},
        assembledText: 'Story text',
        isFavorite: false,
      });

      // Favorite template
      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).toContain(templateId);

      // Favorite completed story
      useStoryStore.getState().toggleFavorite(storyId);
      expect(useStoryStore.getState().completedStories[0].isFavorite).toBe(true);

      // Remove template from favorites
      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).not.toContain(templateId);
      // Completed story remains favorite
      expect(useStoryStore.getState().completedStories[0].isFavorite).toBe(true);
    });

    test('clearing history clears completed stories while preserving favorite templates', () => {
      const templateId = ALL_STORIES[0].id;
      useStoryStore.getState().toggleFavoriteTemplate(templateId);

      useStoryStore.getState().addCompletedStory({
        id: 'story-1',
        templateId,
        title: 'Title 1',
        category: 'adventure',
        completedAt: new Date().toISOString(),
        userWords: {},
        assembledText: 'Text 1',
        isFavorite: true,
      });

      expect(useStoryStore.getState().completedStories).toHaveLength(1);
      expect(useStoryStore.getState().favoriteTemplateIds).toContain(templateId);

      useStoryStore.getState().clearAllCompleted();

      expect(useStoryStore.getState().completedStories).toHaveLength(0);
      expect(useStoryStore.getState().favoriteTemplateIds).toContain(templateId);
    });
  });

  describe('4. Share & Clipboard Actions', () => {
    test('shareText invokes native share with title and full story', async () => {
      const title = 'The Funny Spaceship';
      const text = 'Peter boarded the cheesecake-powered spaceship.';

      const result = await appShare.shareText(title, text);
      expect(result.success).toBe(true);
    });

    test('copyToClipboard copies story text to clipboard successfully', async () => {
      const result = await appShare.copyToClipboard('Title', 'Full story text');
      expect(result.success).toBe(true);
    });
  });

  describe('5. Malformed Stored Data & Recovery (Sanitization & Corruption Handling)', () => {
    test('handles corrupted stored state structure gracefully', () => {
      const storeOptions = (useStoryStore as any).persist?.getOptions?.();
      const mergeFn = storeOptions?.merge;

      const corruptState = {
        completedStories: 'invalid',
        favoriteTemplateIds: [123, null, 'valid-id'],
        recentPlayedTemplateIds: 'not_an_array',
        drafts: null,
      };

      const sanitized = mergeFn(corruptState, useStoryStore.getState());
      expect(Array.isArray(sanitized.completedStories)).toBe(true);
      expect(sanitized.completedStories).toEqual([]);
      expect(sanitized.favoriteTemplateIds).toEqual(['valid-id']);
      expect(sanitized.recentPlayedTemplateIds).toEqual([]);
      expect(sanitized.drafts).toEqual({});
    });

    test('reverts corrupted settings values automatically to default boundaries', () => {
      const settingsOptions = (useSettingsStore as any).persist?.getOptions?.();
      const mergeFn = settingsOptions?.merge;

      const corruptSettings = {
        settings: {
          themeMode: 'invalid_mode',
          fontSizeMultiplier: 999, // too large
          hapticEnabled: 'yes', // non-boolean
          ttsRate: -5, // too small
        },
      };

      const sanitized = mergeFn(corruptSettings, useSettingsStore.getState());
      expect(sanitized.settings.themeMode).toBe(DEFAULT_SETTINGS.themeMode);
      expect(sanitized.settings.fontSizeMultiplier).toBe(DEFAULT_SETTINGS.fontSizeMultiplier);
      expect(sanitized.settings.hapticEnabled).toBe(DEFAULT_SETTINGS.hapticEnabled);
      expect(sanitized.settings.ttsRate).toBe(DEFAULT_SETTINGS.ttsRate);
    });
  });
});
