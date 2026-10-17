import { describe, test, expect } from '@jest/globals';
import {
  normalizeWord,
  validateWordInput,
  validateAllWords,
  formatWordTypeLabel,
  MAX_WORD_LENGTH,
} from './wordInputValidator';
import { WordPrompt } from '@/types/story';
import { assembleRawText } from './templateParser';

describe('Word Input Validation & International Character Support', () => {
  describe('1. International and Accented Characters Support', () => {
    test('preserves lowercase and uppercase accented vowels and diacritics', () => {
      const accentedText = 'Café naïve über-cool crème brûlée';
      const result = validateWordInput(accentedText);

      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('Café naïve über-cool crème brûlée');
    });

    test('supports complex international names and special place names', () => {
      const names = [
        'Renée Dupont',
        'François Moreau',
        'München',
        'São Paulo',
        'Reykjavík',
        'Łódź',
      ];

      for (const name of names) {
        const result = validateWordInput(name);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe(name);
      }
    });

    test('supports diverse verbs, nouns, and adjectives with hyphens and spaces', () => {
      const words = [
        'jump-around',
        'sparkly-unicorn',
        'breathtaking',
        'clumsily dancing',
        'super-duper',
      ];

      for (const word of words) {
        const result = validateWordInput(word);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe(word);
      }
    });
  });

  describe('2. Whitespace and Normalization', () => {
    test('trims leading and trailing spaces', () => {
      const input = '   superhero cat   ';
      const normalized = normalizeWord(input);
      expect(normalized).toBe('superhero cat');
    });

    test('collapses multiple consecutive internal spaces and tabs into a single space', () => {
      const input = 'flying      golden    car';
      const normalized = normalizeWord(input);
      expect(normalized).toBe('flying golden car');
    });

    test('handles empty or nullish input gracefully', () => {
      expect(normalizeWord('')).toBe('');
      expect(normalizeWord('   ')).toBe('');
    });
  });

  describe('3. Required Fields and Empty Input Handling', () => {
    test('rejects empty string when field is required', () => {
      const result = validateWordInput('', true);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    test('rejects whitespace-only string when field is required', () => {
      const result = validateWordInput('     ', true);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    test('accepts empty string when field is optional (isRequired = false)', () => {
      const result = validateWordInput('', false);
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('');
    });
  });

  describe('4. Length Constraints (MAX_WORD_LENGTH = 50)', () => {
    test('accepts valid words within 50 characters', () => {
      const word = 'Very long but still permissible word phrase';
      expect(word.length).toBeLessThanOrEqual(MAX_WORD_LENGTH);

      const result = validateWordInput(word);
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe(word);
    });

    test('rejects inputs longer than 50 characters', () => {
      const tooLong = 'a'.repeat(MAX_WORD_LENGTH + 1);
      const result = validateWordInput(tooLong);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain(String(MAX_WORD_LENGTH));
    });
  });

  describe('5. Story-Wide Validation (validateAllWords)', () => {
    const mockPrompts: WordPrompt[] = [
      {
        id: 'p_name',
        label: 'Person Name',
        instruction: 'Enter a name',
        type: 'person_name',
        examples: ['Alice'],
        isRequired: true,
      },
      {
        id: 'p_adj',
        label: 'Adjective',
        instruction: 'Enter an adjective',
        type: 'adjective',
        examples: ['funny'],
        isRequired: true,
      },
      {
        id: 'p_opt',
        label: 'Optional item',
        instruction: 'Enter something or leave empty',
        type: 'general',
        examples: ['gadget'],
        isRequired: false,
      },
    ];

    test('returns invalid if any required word is missing', () => {
      const enteredWords = {
        p_name: 'Joseph',
        p_adj: '   ', // whitespace only
      };

      const result = validateAllWords(mockPrompts, enteredWords);

      expect(result.isValid).toBe(false);
      expect(result.missingPromptIds).toEqual(['p_adj']);
      expect(result.firstInvalidIndex).toBe(1);
    });

    test('returns valid when all required words are provided', () => {
      const enteredWords = {
        p_name: '  Bob Smith  ',
        p_adj: 'clever',
        p_opt: '', // optional is fine
      };

      const result = validateAllWords(mockPrompts, enteredWords);

      expect(result.isValid).toBe(true);
      expect(result.missingPromptIds).toEqual([]);
      expect(result.firstInvalidIndex).toBe(-1);
      expect(result.normalizedWords['p_name']).toBe('Bob Smith');
      expect(result.normalizedWords['p_adj']).toBe('clever');
    });
  });

  describe('6. English Type Labels', () => {
    test('formats all word types into English labels', () => {
      expect(formatWordTypeLabel('noun')).toBe('Noun');
      expect(formatWordTypeLabel('adjective')).toBe('Adjective');
      expect(formatWordTypeLabel('verb')).toBe('Verb');
      expect(formatWordTypeLabel('person_name')).toBe('Person Name');
      expect(formatWordTypeLabel('location')).toBe('Location / Place');
      expect(formatWordTypeLabel('food')).toBe('Food / Drink');
      expect(formatWordTypeLabel('animal')).toBe('Animal');
      expect(formatWordTypeLabel('number')).toBe('Number');
      expect(formatWordTypeLabel('exclamation')).toBe('Exclamation');
      expect(formatWordTypeLabel('general')).toBe('General Word');
    });
  });

  describe('7. Diacritics in Template Substitution', () => {
    test('assembles text with accented and international words properly', () => {
      const template = 'Once upon a time in {{city}}, Chef {{name}} prepared delicious {{food}}.';
      const words = {
        city: 'São Paulo',
        name: 'Renée',
        food: 'crème brûlée',
      };

      const assembled = assembleRawText(template, words);

      expect(assembled).toBe(
        'Once upon a time in São Paulo, Chef Renée prepared delicious crème brûlée.'
      );
    });
  });
});
