import { describe, it, expect } from '@jest/globals';
import {
  validateStoryTemplate,
  validateStoriesCollection,
  safelySubstituteStory,
  VALID_WORD_TYPES,
} from './storyValidator';
import { ALL_STORIES } from '@/data/stories';
import { StoryTemplate } from '@/types/story';

describe('Story Validation & Template Integrity Suite', () => {
  describe('Built-in Sample Stories Validation', () => {
    it('contains at least 10 unique original stories in the collection', () => {
      expect(ALL_STORIES.length).toBeGreaterThanOrEqual(10);
      expect(ALL_STORIES.length).toBe(39);
    });

    it('passes validation for all built-in stories without errors', () => {
      const collectionResult = validateStoriesCollection(ALL_STORIES);

      expect(collectionResult.invalidStories).toEqual([]);
      expect(collectionResult.duplicateIds).toEqual([]);
      expect(collectionResult.validStories.length).toBe(ALL_STORIES.length);
    });

    it('ensures no missing placeholders or orphan prompts exist in any built-in story', () => {
      for (const story of ALL_STORIES) {
        const result = validateStoryTemplate(story);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
        // Warnings array should not have orphan prompt errors
        const placeholderWarnings = result.warnings.filter((w) =>
          w.includes('does not appear in the template text')
        );
        expect(placeholderWarnings).toEqual([]);
      }
    });

    it('covers all essential word types (noun, adjective, verb, person_name, location, general)', () => {
      const usedTypes = new Set<string>();

      for (const story of ALL_STORIES) {
        for (const prompt of story.prompts) {
          usedTypes.add(prompt.type);
        }
      }

      expect(usedTypes.has('noun')).toBe(true);
      expect(usedTypes.has('adjective')).toBe(true);
      expect(usedTypes.has('verb')).toBe(true);
      expect(usedTypes.has('person_name')).toBe(true);
      expect(usedTypes.has('location')).toBe(true);
      expect(usedTypes.has('general')).toBe(true);
    });

    it('ensures all stories contain valid id, title, description, language, and metadata', () => {
      for (const story of ALL_STORIES) {
        expect(story.id).toBeTruthy();
        expect(story.title).toBeTruthy();
        expect(story.description).toBeTruthy();
        expect(story.language).toBe('en');
        expect(story.templateText).toBeTruthy();
        expect(story.metadata).toBeDefined();
        expect(story.metadata.estimatedMinutes).toBeGreaterThan(0);
        expect(story.metadata.iconName).toBeTruthy();
        expect(story.metadata.author).toBeTruthy();
        expect(story.prompts.length).toBeGreaterThanOrEqual(12);

        for (const prompt of story.prompts) {
          expect(prompt.id).toBeTruthy();
          expect(prompt.label).toBeTruthy();
          expect(VALID_WORD_TYPES).toContain(prompt.type);
          expect(prompt.examples.length).toBeGreaterThan(0);
        }
      }
    });

    it('ensures no {{...}} placeholders remain in completed story after substitution', () => {
      for (const story of ALL_STORIES) {
        // Generate mock user words
        const mockWords: Record<string, string> = {};
        for (const prompt of story.prompts) {
          mockWords[prompt.id] = `[TEST_${prompt.id.toUpperCase()}]`;
        }

        const assembled = safelySubstituteStory(story, mockWords);

        // No unresolved {{...}} in text
        expect(assembled).not.toMatch(/\{\{([a-zA-Z0-9_-]+)\}\}/);

        // Every provided word must appear in the result
        for (const prompt of story.prompts) {
          expect(assembled).toContain(mockWords[prompt.id]);
        }
      }
    });

    it('uses automatic fallback and does not crash when user provides partial words', () => {
      const story = ALL_STORIES[0];
      const partialWords: Record<string, string> = {
        [story.prompts[0].id]: 'CustomWord',
      };

      const assembled = safelySubstituteStory(story, partialWords);

      // No unresolved {{...}} token remaining
      expect(assembled).not.toMatch(/\{\{([a-zA-Z0-9_-]+)\}\}/);
      expect(assembled).toContain('CustomWord');
    });
  });

  describe('Data Validation, Error Handling, and Resilience', () => {
    it('reports an error when a template placeholder has no corresponding defined prompt', () => {
      const corruptStory: StoryTemplate = {
        id: 'corrupt-1',
        title: 'Corrupt Story',
        category: 'funny',
        language: 'en',
        description: 'Test',
        templateText: 'Once upon a time there was a {{missing_field}} figure.',
        prompts: [
          {
            id: 'existing_field',
            label: 'Existing field',
            instruction: 'Enter something!',
            type: 'noun',
            examples: ['something'],
          },
        ],
        metadata: {
          difficulty: 'easy',
          estimatedMinutes: 1,
          iconName: 'Pizza',
          author: 'Test',
          tags: [],
        },
        difficulty: 'easy',
        estimatedMinutes: 1,
        iconName: 'Pizza',
      };

      const result = validateStoryTemplate(corruptStory);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing_field'))).toBe(true);
    });

    it('reports an error when duplicate prompt IDs exist', () => {
      const duplicatePromptStory: any = {
        id: 'dup-1',
        title: 'Duplicate Prompt Story',
        category: 'funny',
        language: 'en',
        templateText: '{{field_1}} and {{field_1}}',
        prompts: [
          { id: 'field_1', label: 'First', instruction: 'First', type: 'noun', examples: [] },
          { id: 'field_1', label: 'Second', instruction: 'Second', type: 'noun', examples: [] },
        ],
      };

      const result = validateStoryTemplate(duplicatePromptStory);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.toLowerCase().includes('duplicate'))).toBe(true);
    });

    it('filters out corrupt stories in collections without throwing exceptions', () => {
      const mixedCollection = [
        ALL_STORIES[0],
        null,
        undefined,
        { id: '', title: '' }, // invalid object
        ALL_STORIES[1],
      ];

      const result = validateStoriesCollection(mixedCollection);
      expect(result.validStories.length).toBe(2);
      expect(result.invalidStories.length).toBe(3);
    });

    it('returns empty string gracefully and does not throw for null or invalid inputs in safelySubstituteStory', () => {
      expect(safelySubstituteStory(null as any, {})).toBe('');
      expect(safelySubstituteStory({} as any, {})).toBe('');
    });
  });
});
