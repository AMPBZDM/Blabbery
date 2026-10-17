import { describe, test, expect, beforeEach } from '@jest/globals';
import { ALL_STORIES } from '@/data/stories';
import { CATEGORY_DEFINITIONS } from '@/data/categories';
import { StoryCategory } from '@/types/story';
import { useStoryStore } from '@/store/useStoryStore';

describe('Story Selection & Category Flow', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStoryStore.setState({
      favoriteTemplateIds: [],
      completedStories: [],
      drafts: {},
    });
  });

  describe('1. Category Distribution and Integrity', () => {
    test('all stories in ALL_STORIES belong to a valid category definition', () => {
      const validCategoryIds = new Set(CATEGORY_DEFINITIONS.map((c) => c.id));

      for (const story of ALL_STORIES) {
        expect(validCategoryIds.has(story.category)).toBe(true);
      }
    });

    test('every defined category has at least one story in ALL_STORIES', () => {
      const counts: Record<string, number> = {};
      for (const cat of CATEGORY_DEFINITIONS) {
        counts[cat.id] = 0;
      }

      for (const story of ALL_STORIES) {
        counts[story.category] = (counts[story.category] || 0) + 1;
      }

      for (const cat of CATEGORY_DEFINITIONS) {
        expect(counts[cat.id]).toBeGreaterThan(0);
      }
    });

    test('filtering by category returns only stories belonging to that category', () => {
      const categoriesToTest: Exclude<StoryCategory, 'all'>[] = [
        'funny',
        'adventure',
        'scifi',
        'school_work',
        'animals',
        'spooky',
      ];

      for (const category of categoriesToTest) {
        const filtered = ALL_STORIES.filter((s) => s.category === category);
        expect(filtered.length).toBeGreaterThan(0);
        for (const story of filtered) {
          expect(story.category).toBe(category);
        }
      }
    });

    test('filtering for an unknown or empty category returns an empty array', () => {
      const filtered = ALL_STORIES.filter(
        (s) => (s.category as string) === 'non_existent_category'
      );
      expect(filtered).toHaveLength(0);
    });
  });

  describe('2. Search Filtering', () => {
    test('search query filters stories by title case-insensitively', () => {
      const query = 'pizza';
      const filtered = ALL_STORIES.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );

      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.some((s) => s.id === 'story-pizza-courier')
      ).toBe(true);
    });

    test('search query that does not match returns an empty list', () => {
      const query = 'xyznonexistentword987';
      const filtered = ALL_STORIES.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );

      expect(filtered).toHaveLength(0);
    });
  });

  describe('3. Story Selection and ID Lookup', () => {
    test('every story ID is unique across the catalog', () => {
      const seenIds = new Set<string>();
      for (const story of ALL_STORIES) {
        expect(seenIds.has(story.id)).toBe(false);
        seenIds.add(story.id);
      }
    });

    test('selecting a story by ID reliably resolves the exact template for gameplay', () => {
      for (const story of ALL_STORIES) {
        const targetId = story.id;
        const resolved = ALL_STORIES.find((s) => s.id === targetId);

        expect(resolved).toBeDefined();
        expect(resolved?.id).toBe(story.id);
        expect(resolved?.title).toBe(story.title);
        expect(resolved?.prompts.length).toBeGreaterThan(0);
        expect(resolved?.templateText.length).toBeGreaterThan(0);
      }
    });

    test('attempting to resolve an invalid story ID returns undefined', () => {
      const invalid = ALL_STORIES.find((s) => s.id === 'non-existent-story-id');
      expect(invalid).toBeUndefined();
    });
  });

  describe('4. Story Template Favoriting in Store', () => {
    test('initially has no favorited templates', () => {
      const state = useStoryStore.getState();
      expect(state.favoriteTemplateIds).toEqual([]);
    });

    test('toggling favorite adds the template ID', () => {
      const templateId = 'story-pizza-courier';
      useStoryStore.getState().toggleFavoriteTemplate(templateId);

      const state = useStoryStore.getState();
      expect(state.favoriteTemplateIds).toContain(templateId);
      expect(state.favoriteTemplateIds).toHaveLength(1);
    });

    test('toggling favorite again removes the template ID', () => {
      const templateId = 'story-pizza-courier';
      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).toContain(templateId);

      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).not.toContain(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).toHaveLength(0);
    });

    test('can favorite multiple story templates independently', () => {
      const id1 = 'story-pizza-courier';
      const id2 = 'story-scifi-spaceship';

      useStoryStore.getState().toggleFavoriteTemplate(id1);
      useStoryStore.getState().toggleFavoriteTemplate(id2);

      const state = useStoryStore.getState();
      expect(state.favoriteTemplateIds).toEqual([id1, id2]);

      // Remove only id1
      useStoryStore.getState().toggleFavoriteTemplate(id1);
      expect(useStoryStore.getState().favoriteTemplateIds).toEqual([id2]);
    });
  });

  describe('5. Story Detail Adatlap Prompt Breakdown', () => {
    test('all prompts in every template have a valid WordFieldType', () => {
      const validTypes = new Set([
        'noun',
        'adjective',
        'verb',
        'person_name',
        'location',
        'general',
        'food',
        'animal',
        'number',
        'exclamation',
      ]);

      for (const story of ALL_STORIES) {
        for (const prompt of story.prompts) {
          expect(validTypes.has(prompt.type)).toBe(true);
        }
      }
    });

    test('prompt breakdown accurately aggregates counts for story adatlap', () => {
      const story = ALL_STORIES[0];
      const counts: Record<string, number> = {};

      for (const prompt of story.prompts) {
        counts[prompt.type] = (counts[prompt.type] || 0) + 1;
      }

      const totalCounted = Object.values(counts).reduce((a, b) => a + b, 0);
      expect(totalCounted).toBe(story.prompts.length);
    });
  });
});
