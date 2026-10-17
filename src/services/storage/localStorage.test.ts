import { describe, test, expect, beforeEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStoryStore } from '@/store/useStoryStore';
import { useSettingsStore, DEFAULT_SETTINGS } from '@/store/useSettingsStore';
import { CompletedStory, StoryDraft } from '@/types/story';

describe('Local Storage & Persistence Test Suite', () => {
  beforeEach(async () => {
    // Clear AsyncStorage and reset Zustand stores before each test
    await AsyncStorage.clear();
    useStoryStore.getState().resetAllStoryData();
    useSettingsStore.getState().resetSettings();
  });

  describe('1. Save and Retrieve Completed Stories', () => {
    const mockCompletedStory: CompletedStory = {
      id: 'story-1728825000',
      templateId: 'story-pizza-courier',
      title: 'The Disastrous Pizza Delivery',
      category: 'funny',
      completedAt: '2026-10-13T12:00:00.000Z',
      userWords: {
        p_name: 'Bob',
        p_food: 'pineapple pizza',
      },
      assembledText: 'Bob delivered the box of pineapple pizza.',
      isFavorite: false,
    };

    test('successfully saves completed story to local storage', () => {
      useStoryStore.getState().addCompletedStory(mockCompletedStory);

      const state = useStoryStore.getState();
      expect(state.completedStories).toHaveLength(1);
      expect(state.completedStories[0].id).toBe('story-1728825000');
      expect(state.completedStories[0].title).toBe('The Disastrous Pizza Delivery');
      expect(state.recentPlayedTemplateIds).toContain('story-pizza-courier');
    });

    test('prepends newer stories to the beginning (chronological ordering)', () => {
      const story1 = { ...mockCompletedStory, id: 'story-1', title: 'First' };
      const story2 = { ...mockCompletedStory, id: 'story-2', title: 'Second' };

      useStoryStore.getState().addCompletedStory(story1);
      useStoryStore.getState().addCompletedStory(story2);

      const state = useStoryStore.getState();
      expect(state.completedStories).toHaveLength(2);
      expect(state.completedStories[0].id).toBe('story-2');
      expect(state.completedStories[1].id).toBe('story-1');
    });

    test('adding story with same ID overwrites existing one (no duplication)', () => {
      const original = { ...mockCompletedStory, assembledText: 'Original text' };
      const updated = { ...mockCompletedStory, assembledText: 'Updated text' };

      useStoryStore.getState().addCompletedStory(original);
      useStoryStore.getState().addCompletedStory(updated);

      const state = useStoryStore.getState();
      expect(state.completedStories).toHaveLength(1);
      expect(state.completedStories[0].assembledText).toBe('Updated text');
    });
  });

  describe('2. Delete Stories and History', () => {
    const storyA: CompletedStory = {
      id: 'story-a',
      templateId: 'template-a',
      title: 'Story A',
      category: 'funny',
      completedAt: '2026-10-13T10:00:00Z',
      userWords: {},
      assembledText: 'Text A',
      isFavorite: false,
    };

    const storyB: CompletedStory = {
      id: 'story-b',
      templateId: 'template-b',
      title: 'Story B',
      category: 'scifi',
      completedAt: '2026-10-13T11:00:00Z',
      userWords: {},
      assembledText: 'Text B',
      isFavorite: true,
    };

    test('deletes individual story by ID', () => {
      useStoryStore.getState().addCompletedStory(storyA);
      useStoryStore.getState().addCompletedStory(storyB);
      expect(useStoryStore.getState().completedStories).toHaveLength(2);

      // Delete storyA
      useStoryStore.getState().deleteCompletedStory('story-a');

      const state = useStoryStore.getState();
      expect(state.completedStories).toHaveLength(1);
      expect(state.completedStories[0].id).toBe('story-b');
    });

    test('clears all completed stories (clearAllCompleted)', () => {
      useStoryStore.getState().addCompletedStory(storyA);
      useStoryStore.getState().addCompletedStory(storyB);

      useStoryStore.getState().clearAllCompleted();

      const state = useStoryStore.getState();
      expect(state.completedStories).toEqual([]);
    });

    test('resets all story data (resetAllStoryData)', () => {
      useStoryStore.getState().addCompletedStory(storyA);
      useStoryStore.getState().toggleFavoriteTemplate('template-a');
      useStoryStore.getState().saveDraft({
        templateId: 'template-a',
        currentStepIndex: 1,
        enteredWords: { p1: 'word' },
        updatedAt: '2026-10-13',
      });

      useStoryStore.getState().resetAllStoryData();

      const state = useStoryStore.getState();
      expect(state.completedStories).toEqual([]);
      expect(state.favoriteTemplateIds).toEqual([]);
      expect(state.recentPlayedTemplateIds).toEqual([]);
      expect(state.drafts).toEqual({});
    });
  });

  describe('3. Draft Storage and Automatic Cleanup', () => {
    test('saves draft and automatically deletes it upon story completion', () => {
      const draft: StoryDraft = {
        templateId: 'story-pizza',
        currentStepIndex: 2,
        enteredWords: { p1: 'Bob', p2: 'Alice' },
        updatedAt: '2026-10-13T12:00:00Z',
      };

      useStoryStore.getState().saveDraft(draft);

      let state = useStoryStore.getState();
      expect(state.drafts['story-pizza']).toEqual(draft);

      // Once the story completes, draft is removed automatically
      useStoryStore.getState().addCompletedStory({
        id: 'completed-1',
        templateId: 'story-pizza',
        title: 'Ready Pizza',
        category: 'funny',
        completedAt: '2026-10-13T12:05:00Z',
        userWords: { p1: 'Bob', p2: 'Alice' },
        assembledText: 'Bob and Alice enjoyed the pizza.',
        isFavorite: false,
      });

      state = useStoryStore.getState();
      expect(state.drafts['story-pizza']).toBeUndefined();
    });
  });

  describe('4. Favorite Templates and Stories', () => {
    test('toggles favorite template idempotently without duplicates', () => {
      const templateId = 'story-scifi-spaceship';

      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).toContain(templateId);

      // Second toggle removes it
      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).not.toContain(templateId);
    });

    test('toggles favorite status on completed story', () => {
      const story: CompletedStory = {
        id: 'story-fav',
        templateId: 'story-x',
        title: 'Story',
        category: 'animals',
        completedAt: '2026-10-13T12:00:00Z',
        userWords: {},
        assembledText: 'Text',
        isFavorite: false,
      };

      useStoryStore.getState().addCompletedStory(story);
      expect(useStoryStore.getState().completedStories[0].isFavorite).toBe(false);

      useStoryStore.getState().toggleFavorite('story-fav');
      expect(useStoryStore.getState().completedStories[0].isFavorite).toBe(true);

      useStoryStore.getState().toggleFavorite('story-fav');
      expect(useStoryStore.getState().completedStories[0].isFavorite).toBe(false);
    });
  });

  describe('5. User Settings Local Storage (useSettingsStore)', () => {
    test('loads default settings', () => {
      const state = useSettingsStore.getState();
      expect(state.settings).toEqual(DEFAULT_SETTINGS);
    });

    test('persistently saves settings modifications', () => {
      useSettingsStore.getState().setThemeMode('dark');
      useSettingsStore.getState().setFontSizeMultiplier(1.18);
      useSettingsStore.getState().setHapticEnabled(false);
      useSettingsStore.getState().setTtsRate(1.2);
      useSettingsStore.getState().setShowWordSuggestions(true);

      const state = useSettingsStore.getState();
      expect(state.settings.themeMode).toBe('dark');
      expect(state.settings.fontSizeMultiplier).toBe(1.18);
      expect(state.settings.hapticEnabled).toBe(false);
      expect(state.settings.ttsRate).toBe(1.2);
      expect(state.settings.showWordSuggestions).toBe(true);
    });

    test('resets settings to defaults (resetSettings)', () => {
      useSettingsStore.getState().setThemeMode('dark');
      useSettingsStore.getState().resetSettings();

      expect(useSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('6. Handling Corrupted, Malformed, and Missing Stored Data (Sanitization & Recovery)', () => {
    test('filters out malformed story records via store merge function', () => {
      const storeOptions = (useStoryStore as any).persist?.getOptions?.();
      const mergeFn = storeOptions?.merge;

      expect(typeof mergeFn).toBe('function');

      const corruptedPersistedState = {
        completedStories: [
          // Valid story
          {
            id: 'valid-1',
            templateId: 'template-1',
            title: 'Valid',
            category: 'funny',
            completedAt: '2026-10-13T12:00:00Z',
            userWords: {},
            assembledText: 'Text',
            isFavorite: false,
          },
          // Corrupted story: missing id and assembledText
          {
            title: 'Corrupt item',
          },
          null,
          'invalid_string',
        ],
        favoriteTemplateIds: ['fav-1', 123, null],
        recentPlayedTemplateIds: ['rec-1', {}],
        drafts: 'not_an_object_but_string',
      };

      const currentState = useStoryStore.getState();
      const sanitized = mergeFn(corruptedPersistedState, currentState);

      // Only the 1 valid story remains
      expect(sanitized.completedStories).toHaveLength(1);
      expect(sanitized.completedStories[0].id).toBe('valid-1');

      // Only valid string IDs remain
      expect(sanitized.favoriteTemplateIds).toEqual(['fav-1']);
      expect(sanitized.recentPlayedTemplateIds).toEqual(['rec-1']);

      // Non-object draft falls back to empty object
      expect(sanitized.drafts).toEqual({});
    });

    test('reverts corrupted settings to defaults', () => {
      const storeOptions = (useSettingsStore as any).persist?.getOptions?.();
      const mergeFn = storeOptions?.merge;

      expect(typeof mergeFn).toBe('function');

      const corruptedSettingsState = {
        settings: {
          themeMode: 'unknown_nonexistent_theme',
          fontSizeMultiplier: -5.0, // Invalid negative multiplier
          hapticEnabled: 'not_a_boolean',
          ttsRate: 99.9, // Invalid extreme TTS rate
          showWordSuggestions: 'not_a_boolean',
        },
      };

      const currentState = useSettingsStore.getState();
      const sanitized = mergeFn(corruptedSettingsState, currentState);

      expect(sanitized.settings.themeMode).toBe('system');
      expect(sanitized.settings.fontSizeMultiplier).toBe(1.0);
      expect(sanitized.settings.hapticEnabled).toBe(true);
      expect(sanitized.settings.ttsRate).toBe(1.0);
      expect(sanitized.settings.showWordSuggestions).toBe(false);
    });

    test('preserves currentState intact when stored data is null or undefined', () => {
      const storeOptions = (useStoryStore as any).persist?.getOptions?.();
      const mergeFn = storeOptions?.merge;

      const currentState = useStoryStore.getState();
      expect(mergeFn(null, currentState)).toEqual(currentState);
      expect(mergeFn(undefined, currentState)).toEqual(currentState);
    });
  });

  describe('7. Privacy and Absence of Telemetry or Personal Identifiers', () => {
    test('stored records do not contain personal or telemetry identifiers', () => {
      const story: CompletedStory = {
        id: `story-${Date.now()}`,
        templateId: 'test-template',
        title: 'Story',
        category: 'funny',
        completedAt: new Date().toISOString(),
        userWords: { k1: 'dog' },
        assembledText: 'The dog ran.',
        isFavorite: false,
      };

      useStoryStore.getState().addCompletedStory(story);

      const saved = useStoryStore.getState().completedStories[0];
      const keys = Object.keys(saved);

      // Verify only essential fields exist
      expect(keys.sort()).toEqual([
        'assembledText',
        'category',
        'completedAt',
        'id',
        'isFavorite',
        'templateId',
        'title',
        'userWords',
      ]);

      // No IP, no user email, no device ID
      expect((saved as any).userId).toBeUndefined();
      expect((saved as any).deviceId).toBeUndefined();
      expect((saved as any).ipAddress).toBeUndefined();
    });
  });
});
