import { StoryTemplate, WordPrompt, WordFieldType } from '@/types/story';

export const VALID_WORD_TYPES: WordFieldType[] = [
  'noun',
  'adjective',
  'verb',
  'person_name',
  'location',
  'food',
  'animal',
  'number',
  'exclamation',
  'general',
];

export interface StoryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a single story template. Checks required fields,
 * unique prompt IDs, and exact placeholder {{...}} matching.
 */
export function validateStoryTemplate(story: any): StoryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!story || typeof story !== 'object') {
    return {
      isValid: false,
      errors: ['The template is not a valid object.'],
      warnings: [],
    };
  }

  // 1. Check basic metadata
  if (!story.id || typeof story.id !== 'string' || !story.id.trim()) {
    errors.push('Story ID (id) is missing or invalid.');
  }

  if (!story.title || typeof story.title !== 'string' || !story.title.trim()) {
    errors.push('Story title (title) is missing or empty.');
  }

  if (!story.category || typeof story.category !== 'string') {
    errors.push('Story category (category) is missing.');
  }

  if (!story.language || typeof story.language !== 'string') {
    warnings.push('Story language is not explicitly provided, default "en".');
  }

  if (!story.description || typeof story.description !== 'string') {
    warnings.push('Story description (description) is missing or empty.');
  }

  // 2. Check template text
  if (
    !story.templateText ||
    typeof story.templateText !== 'string' ||
    !story.templateText.trim()
  ) {
    errors.push('Story template text (templateText) is missing or empty.');
    return { isValid: false, errors, warnings };
  }

  // 3. Check prompts
  if (!Array.isArray(story.prompts) || story.prompts.length === 0) {
    errors.push('Story has no fillable prompts (prompts array is empty).');
    return { isValid: false, errors, warnings };
  }

  const promptIds = new Set<string>();
  const promptMap = new Map<string, WordPrompt>();

  for (let i = 0; i < story.prompts.length; i++) {
    const prompt = story.prompts[i];
    const prefix = `Prompt #${i + 1}`;

    if (!prompt || typeof prompt !== 'object') {
      errors.push(`${prefix} is not a valid object.`);
      continue;
    }

    if (!prompt.id || typeof prompt.id !== 'string' || !prompt.id.trim()) {
      errors.push(`${prefix}: missing unique prompt ID (id).`);
      continue;
    }

    if (promptIds.has(prompt.id)) {
      errors.push(`${prefix}: duplicate prompt ID ("${prompt.id}").`);
    }
    promptIds.add(prompt.id);
    promptMap.set(prompt.id, prompt);

    if (!prompt.label || typeof prompt.label !== 'string' || !prompt.label.trim()) {
      errors.push(`${prefix} ("${prompt.id}"): prompt label is empty.`);
    }

    if (!prompt.type || !VALID_WORD_TYPES.includes(prompt.type)) {
      warnings.push(
        `${prefix} ("${prompt.id}"): unknown prompt type ("${prompt.type}").`
      );
    }
  }

  // 4. Check placeholders and prompt cross-referencing
  const placeholderRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  const placeholdersInText = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(story.templateText)) !== null) {
    const placeholderId = match[1];
    placeholdersInText.add(placeholderId);

    // Every template placeholder MUST have a matching prompt
    if (!promptMap.has(placeholderId)) {
      errors.push(
        `Template placeholder "{{${placeholderId}}}" has no matching defined prompt.`
      );
    }
  }

  // Every defined prompt MUST appear in the template text
  for (const promptId of promptIds) {
    if (!placeholdersInText.has(promptId)) {
      warnings.push(
        `Prompt "${promptId}" is defined, but does not appear in the template text.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an entire collection of stories, filters out invalid templates,
 * and verifies global ID uniqueness.
 */
export function validateStoriesCollection(stories: any[]): {
  validStories: StoryTemplate[];
  invalidStories: { story: any; errors: string[] }[];
  duplicateIds: string[];
} {
  const validStories: StoryTemplate[] = [];
  const invalidStories: { story: any; errors: string[] }[] = [];
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];

  if (!Array.isArray(stories)) {
    return { validStories, invalidStories, duplicateIds };
  }

  for (const story of stories) {
    if (story?.id) {
      if (seenIds.has(story.id)) {
        duplicateIds.push(story.id);
      }
      seenIds.add(story.id);
    }

    const result = validateStoryTemplate(story);
    if (result.isValid) {
      validStories.push(story as StoryTemplate);
    } else {
      invalidStories.push({ story, errors: result.errors });
    }
  }

  return {
    validStories,
    invalidStories,
    duplicateIds,
  };
}

/**
 * Safe text substitution engine: guarantees that no {{...}} placeholders
 * are left unsubstituted in the final story, and prevents app crashes with bad data.
 */
export function safelySubstituteStory(
  story: StoryTemplate,
  userWords: Record<string, string>
): string {
  if (!story || !story.templateText) {
    return '';
  }

  const promptMap = new Map<string, WordPrompt>();
  if (Array.isArray(story.prompts)) {
    for (const p of story.prompts) {
      if (p?.id) {
        promptMap.set(p.id, p);
      }
    }
  }

  return story.templateText.replace(
    /\{\{([a-zA-Z0-9_-]+)\}\}/g,
    (match, placeholderId) => {
      const userWord = userWords?.[placeholderId]?.trim();
      if (userWord) {
        return userWord;
      }

      // Fallback: if user didn't enter a word, use first example
      const prompt = promptMap.get(placeholderId);
      if (prompt?.examples && prompt.examples.length > 0) {
        return prompt.examples[0];
      }

      if (prompt?.label) {
        return `[${prompt.label}]`;
      }

      return `[${placeholderId}]`;
    }
  );
}
