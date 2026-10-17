import { describe, test, expect } from '@jest/globals';
import {
  assembleStoryText,
  tokenizeStorySegments,
  verifyNoRemainingPlaceholders,
  generateCompletedStory,
} from './storyGenerator';
import { StoryTemplate, WordPrompt } from '@/types/story';

describe('Story Generator & Text Assembly Engine Suite', () => {
  const samplePrompts: WordPrompt[] = [
    {
      id: 'character_name',
      label: 'Hero Name',
      instruction: 'Enter a first name',
      type: 'person_name',
      examples: ['Alice', 'Bob'],
      isRequired: true,
    },
    {
      id: 'favorite_food',
      label: 'Favorite Food',
      instruction: 'A tasty or quirky food',
      type: 'food',
      examples: ['pizza', 'pancakes'],
      isRequired: true,
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      instruction: 'How do they travel?',
      type: 'general',
      examples: ['flying carpet'],
      isRequired: true,
    },
  ];

  describe('1. Precise Placeholder Substitution', () => {
    test('replaces all placeholders with appropriate user words', () => {
      const template =
        'Once upon a time, there lived {{character_name}}, who loved the smell of {{favorite_food}}. Every morning, they travelled with a {{vehicle}}.';
      const userWords = {
        character_name: 'Scarlet',
        favorite_food: 'apple strudel',
        vehicle: 'magical skateboard',
      };

      const result = assembleStoryText(template, userWords, samplePrompts);

      expect(result.assembledText).toBe(
        'Once upon a time, there lived Scarlet, who loved the smell of apple strudel. Every morning, they travelled with a magical skateboard.'
      );
      expect(result.substitutedWordCount).toBe(3);
      expect(result.unresolvedPlaceholders).toHaveLength(0);
    });

    test('no unresolved {{...}} placeholders remain in assembled story', () => {
      const template = 'The {{character_name}} loves a bowl of {{favorite_food}}.';
      const userWords = {
        character_name: 'Arthur',
        favorite_food: 'soup',
      };

      const result = assembleStoryText(template, userWords, samplePrompts);
      const check = verifyNoRemainingPlaceholders(result.assembledText);

      expect(check.hasPlaceholders).toBe(false);
      expect(check.placeholders).toHaveLength(0);
    });
  });

  describe('2. Collision Protection for Similar Token IDs', () => {
    test('does not mix up similarly named placeholder IDs (e.g. name, name2, name_full)', () => {
      const template =
        'Mother is {{name}}, father is {{name2}}, and CEO is {{name_full}}.';
      const userWords = {
        name: 'Eve',
        name2: 'Leo',
        name_full: 'John Miller',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe(
        'Mother is Eve, father is Leo, and CEO is John Miller.'
      );
    });

    test('does not confuse numerically similar tokens (e.g. p1 and p10)', () => {
      const template = 'First: {{p1}}, tenth: {{p10}}, hundredth: {{p100}}.';
      const userWords = {
        p1: 'one',
        p10: 'ten',
        p100: 'hundred',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe('First: one, tenth: ten, hundredth: hundred.');
    });
  });

  describe('3. Repeated Words and Multiple Token Occurrences', () => {
    test('same placeholder can appear multiple times and receives identical word', () => {
      const template =
        'When {{hero}} arrived, everyone cheered for {{hero}}. Farewell, {{hero}}!';
      const userWords = {
        hero: 'Super Bob',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe(
        'When Super Bob arrived, everyone cheered for Super Bob. Farewell, Super Bob!'
      );
      expect(result.substitutedWordCount).toBe(3);
    });

    test('different placeholders can receive identical user words without conflict', () => {
      const template = 'For breakfast {{food1}}, for lunch {{food2}}, for dinner also {{food3}}.';
      const userWords = {
        food1: 'pizza',
        food2: 'pizza',
        food3: 'pizza',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe(
        'For breakfast pizza, for lunch pizza, for dinner also pizza.'
      );
    });
  });

  describe('4. Special and Protected Characters Handling', () => {
    test('properly handles dollar signs ($ and $&) without regex replacement glitches', () => {
      const template = 'The price was {{price}}, and the tip was {{tip}}.';
      const userWords = {
        price: '$100',
        tip: '$5 dollars ($&)',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe(
        'The price was $100, and the tip was $5 dollars ($&).'
      );
    });

    test('curly braces in user word do not cause recursive replacement loops', () => {
      const template = 'The magic word was: {{magic_word}}.';
      const userWords = {
        magic_word: '{{something_else}}',
        something_else: 'bad_swap',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe('The magic word was: {{something_else}}.');
    });

    test('preserves accented characters and punctuation', () => {
      const template = 'Favorite animal: {{animal}}, location: {{place}}.';
      const userWords = {
        animal: 'crème-colored wolf',
        place: 'São Paulo (Brazil)',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe(
        'Favorite animal: crème-colored wolf, location: São Paulo (Brazil).'
      );
    });

    test('handles emojis and unicode symbols', () => {
      const template = 'The secret signal was {{symbol}}!';
      const userWords = {
        symbol: '🦄✨🍕',
      };

      const result = assembleStoryText(template, userWords);

      expect(result.assembledText).toBe('The secret signal was 🦄✨🍕!');
    });
  });

  describe('5. Missing and Incomplete Data Handling', () => {
    test('replaces missing words with prompt example fallback when not provided', () => {
      const template = 'The knight was named {{character_name}}.';
      const userWords = {};

      const result = assembleStoryText(template, userWords, samplePrompts);

      expect(result.assembledText).toBe('The knight was named Alice.');
      expect(result.unresolvedPlaceholders).toContain('character_name');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('falls back to bracketed prompt label if no examples exist', () => {
      const template = 'The machine name was {{machine}}.';
      const promptsWithoutExample: WordPrompt[] = [
        {
          id: 'machine',
          label: 'Quirky Gadget',
          instruction: 'Enter a machine',
          type: 'general',
          examples: [],
        },
      ];

      const result = assembleStoryText(template, {}, promptsWithoutExample);

      expect(result.assembledText).toBe('The machine name was [Quirky Gadget].');
    });

    test('handles empty or null template text without throwing errors', () => {
      const result = assembleStoryText('', { word: 'test' });

      expect(result.assembledText).toBe('');
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('6. Tokenization and Segments (tokenizeStorySegments)', () => {
    test('tokenizes story into text and substituted words', () => {
      const template = 'Hello {{name}}! How are you?';
      const segments = tokenizeStorySegments(
        template,
        { name: 'Katie' },
        [{ id: 'name', label: 'Name', instruction: '', type: 'person_name', examples: [] }]
      );

      expect(segments).toEqual([
        { type: 'text', content: 'Hello ' },
        { type: 'word', content: 'Katie', promptId: 'name', promptLabel: 'Name' },
        { type: 'text', content: '! How are you?' },
      ]);
    });

    test('preserves paragraphs and linebreaks', () => {
      const template = 'First paragraph {{word1}}.\n\nSecond paragraph {{word2}}.';
      const segments = tokenizeStorySegments(template, {
        word1: 'here',
        word2: 'there',
      });

      const fullText = segments.map((s) => s.content).join('');
      expect(fullText).toContain('\n\n');
    });
  });

  describe('7. generateCompletedStory Integration', () => {
    test('generates valid StoryGenerationResult from complete template', () => {
      const mockTemplate: StoryTemplate = {
        id: 'story-test',
        title: 'Test Story',
        category: 'funny',
        language: 'en',
        description: 'A test story',
        templateText: 'Once upon a time there was a {{adj}} {{noun}}.',
        prompts: [
          {
            id: 'adj',
            label: 'Adjective',
            instruction: '',
            type: 'adjective',
            examples: ['cheerful'],
          },
          {
            id: 'noun',
            label: 'Noun',
            instruction: '',
            type: 'noun',
            examples: ['bear'],
          },
        ],
        difficulty: 'easy',
        estimatedMinutes: 2,
        iconName: 'Sparkles',
        metadata: {
          difficulty: 'easy',
          estimatedMinutes: 2,
          iconName: 'Sparkles',
          author: 'Test',
          tags: ['test'],
        },
      };

      const result = generateCompletedStory(mockTemplate, {
        adj: 'blue',
        noun: 'penguin',
      });

      expect(result.success).toBe(true);
      expect(result.assembledText).toBe('Once upon a time there was a blue penguin.');
      expect(result.substitutedWordCount).toBe(2);
      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.unresolvedPlaceholders).toHaveLength(0);
    });
  });
});
