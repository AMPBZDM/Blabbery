import { describe, it, expect } from '@jest/globals';
import {
  assembleRawText,
  parseStorySegments,
} from './templateParser';
import { WordPrompt } from '@/types/story';

describe('templateParser', () => {
  const samplePrompts: WordPrompt[] = [
    {
      id: 'w_name',
      label: 'First Name',
      instruction: 'Enter a first name!',
      type: 'person_name',
      category: 'proper_noun',
      examples: ['Alice'],
    },
    {
      id: 'w_adj',
      label: 'Adjective',
      instruction: 'Enter an adjective!',
      type: 'adjective',
      category: 'adjective',
      examples: ['funny'],
    },
    {
      id: 'w_noun',
      label: 'Noun',
      instruction: 'Enter a noun!',
      type: 'noun',
      category: 'noun',
      examples: ['duck'],
    },
  ];

  describe('assembleRawText', () => {
    it('correctly substitutes user words into tokens', () => {
      const template = 'Once upon a time there was a {{w_adj}} {{w_noun}} called by {{w_name}}.';
      const words = {
        w_adj: 'purple',
        w_noun: 'penguin',
        w_name: 'Peter',
      };

      const result = assembleRawText(template, words);
      expect(result).toBe('Once upon a time there was a purple penguin called by Peter.');
    });

    it('handles missing words by falling back to the bracketed token id', () => {
      const template = 'I saw a {{w_adj}} {{w_noun}}.';
      const words = {
        w_adj: 'sparkling',
      };

      const result = assembleRawText(template, words);
      expect(result).toBe('I saw a sparkling [w_noun].');
    });

    it('trims leading and trailing whitespace from entered words', () => {
      const template = 'Hello, {{w_name}}!';
      const words = {
        w_name: '   Bob Smith   ',
      };

      const result = assembleRawText(template, words);
      expect(result).toBe('Hello, Bob Smith!');
    });

    it('returns empty string for empty template', () => {
      expect(assembleRawText('', {})).toBe('');
    });
  });

  describe('parseStorySegments', () => {
    it('breaks text into text and word typed segments', () => {
      const template = 'On a {{w_adj}} day, {{w_name}} walked.';
      const words = {
        w_adj: 'wonderful',
        w_name: 'Anna',
      };

      const segments = parseStorySegments(template, words, samplePrompts);

      expect(segments).toEqual([
        { type: 'text', content: 'On a ' },
        {
          type: 'word',
          content: 'wonderful',
          promptId: 'w_adj',
          promptLabel: 'Adjective',
        },
        { type: 'text', content: ' day, ' },
        {
          type: 'word',
          content: 'Anna',
          promptId: 'w_name',
          promptLabel: 'First Name',
        },
        { type: 'text', content: ' walked.' },
      ]);
    });

    it('handles token located at the very start of the text', () => {
      const template = '{{w_name}} is the best!';
      const words = { w_name: 'George' };

      const segments = parseStorySegments(template, words, samplePrompts);

      expect(segments).toEqual([
        {
          type: 'word',
          content: 'George',
          promptId: 'w_name',
          promptLabel: 'First Name',
        },
        { type: 'text', content: ' is the best!' },
      ]);
    });

    it('returns empty array for empty template', () => {
      expect(parseStorySegments('', {}, [])).toEqual([]);
    });
  });
});
