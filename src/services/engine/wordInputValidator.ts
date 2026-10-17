import { WordFieldType, WordPrompt } from '@/types/story';

export const MAX_WORD_LENGTH = 50;

/**
 * Friendly English label for word field type.
 */
export function formatWordTypeLabel(type: WordFieldType): string {
  switch (type) {
    case 'noun':
      return 'Noun';
    case 'adjective':
      return 'Adjective';
    case 'verb':
      return 'Verb';
    case 'person_name':
      return 'Person Name';
    case 'location':
      return 'Location / Place';
    case 'food':
      return 'Food / Drink';
    case 'animal':
      return 'Animal';
    case 'number':
      return 'Number';
    case 'exclamation':
      return 'Exclamation';
    case 'general':
    default:
      return 'General Word';
  }
}

/**
 * Normalizes user text input:
 * - Trims leading and trailing whitespace
 * - Collapses redundant internal whitespace to a single space
 */
export function normalizeWord(input: string): string {
  if (!input) return '';
  return input.trim().replace(/\s+/g, ' ');
}

export interface WordValidationResult {
  isValid: boolean;
  normalized: string;
  errorMessage?: string;
}

/**
 * Validates single word input:
 * - Checks required fields
 * - Rejects empty or whitespace-only inputs
 * - Enforces maximum length (50 characters)
 */
export function validateWordInput(
  rawInput: string,
  isRequired = true
): WordValidationResult {
  const normalized = normalizeWord(rawInput);

  if (isRequired && normalized.length === 0) {
    return {
      isValid: false,
      normalized: '',
      errorMessage: 'Please enter a word to continue!',
    };
  }

  if (normalized.length > MAX_WORD_LENGTH) {
    return {
      isValid: false,
      normalized,
      errorMessage: `Text cannot exceed ${MAX_WORD_LENGTH} characters!`,
    };
  }

  return {
    isValid: true,
    normalized,
  };
}

export interface AllWordsValidationResult {
  isValid: boolean;
  missingPromptIds: string[];
  normalizedWords: Record<string, string>;
  firstInvalidIndex: number;
}

/**
 * Validates all prompts before final story completion and reveal.
 * Allows story generation only when all required prompts are filled.
 */
export function validateAllWords(
  prompts: WordPrompt[],
  enteredWords: Record<string, string>
): AllWordsValidationResult {
  const missingPromptIds: string[] = [];
  const normalizedWords: Record<string, string> = {};
  let firstInvalidIndex = -1;

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const isRequired = prompt.isRequired !== false;
    const rawVal = enteredWords[prompt.id] || '';
    const validation = validateWordInput(rawVal, isRequired);

    normalizedWords[prompt.id] = validation.normalized;

    if (!validation.isValid) {
      missingPromptIds.push(prompt.id);
      if (firstInvalidIndex === -1) {
        firstInvalidIndex = i;
      }
    }
  }

  return {
    isValid: missingPromptIds.length === 0,
    missingPromptIds,
    normalizedWords,
    firstInvalidIndex,
  };
}
