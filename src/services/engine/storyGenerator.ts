import { StoryTemplate, StoryTextSegment, WordPrompt } from '@/types/story';

export interface StoryGenerationResult {
  success: boolean;
  assembledText: string;
  segments: StoryTextSegment[];
  substitutedWordCount: number;
  unresolvedPlaceholders: string[];
  warnings: string[];
}

/**
 * Regex for matching placeholders: {{placeholderId}}
 * Matches alphanumeric, hyphen, and underscore characters between double curly braces.
 */
export const PLACEHOLDER_REGEX = /\{\{([a-zA-Z0-9_-]+)\}\}/g;

/**
 * Checks whether any unsubstituted {{...}} placeholders remain in the text.
 */
export function verifyNoRemainingPlaceholders(text: string): {
  hasPlaceholders: boolean;
  placeholders: string[];
} {
  if (!text) return { hasPlaceholders: false, placeholders: [] };

  const remaining: string[] = [];
  const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    remaining.push(match[1]);
  }

  return {
    hasPlaceholders: remaining.length > 0,
    placeholders: remaining,
  };
}

/**
 * Assembles the completed story text from the template and user words.
 *
 * Guarantees:
 * 1. Single-pass tokenization prevents recursive placeholder replacement.
 * 2. Exact token boundaries ({{id}}) prevent confusion between similar prompt names.
 * 3. Safe handling of special characters ($, backslashes, quotes) via functional replacement.
 * 4. Fallback mechanism ensures no raw placeholders remain if data is missing.
 */
export function assembleStoryText(
  templateText: string,
  userWords: Record<string, string>,
  prompts: WordPrompt[] = []
): {
  assembledText: string;
  substitutedWordCount: number;
  unresolvedPlaceholders: string[];
  warnings: string[];
} {
  if (!templateText) {
    return {
      assembledText: '',
      substitutedWordCount: 0,
      unresolvedPlaceholders: [],
      warnings: ['Template text is empty.'],
    };
  }

  const promptMap = new Map<string, WordPrompt>();
  for (const p of prompts) {
    if (p?.id) {
      promptMap.set(p.id, p);
    }
  }

  const unresolvedPlaceholders: string[] = [];
  const warnings: string[] = [];
  let substitutedWordCount = 0;

  // Replacer function: return value is treated literally, avoiding $1, $& RegExp replacement quirks
  const assembledText = templateText.replace(
    /\{\{([a-zA-Z0-9_-]+)\}\}/g,
    (_, placeholderId) => {
      const userWord = userWords?.[placeholderId];
      const trimmed = typeof userWord === 'string' ? userWord.trim() : '';

      if (trimmed.length > 0) {
        substitutedWordCount += 1;
        return trimmed;
      }

      // Handle missing word
      unresolvedPlaceholders.push(placeholderId);
      const prompt = promptMap.get(placeholderId);

      if (prompt?.examples && prompt.examples.length > 0) {
        warnings.push(
          `User did not enter a word for "${placeholderId}"; used fallback example "${prompt.examples[0]}".`
        );
        return prompt.examples[0];
      }

      if (prompt?.label) {
        warnings.push(
          `No word entered for "${placeholderId}"; used prompt label.`
        );
        return `[${prompt.label}]`;
      }

      warnings.push(`No defined prompt found for ID "${placeholderId}".`);
      return `[${placeholderId}]`;
    }
  );

  return {
    assembledText,
    substitutedWordCount,
    unresolvedPlaceholders,
    warnings,
  };
}

/**
 * Tokenizes the story text into segments for formatted, highlighted word rendering.
 * Preserves original line breaks (\n and \n\n) for paragraph formatting.
 */
export function tokenizeStorySegments(
  templateText: string,
  userWords: Record<string, string>,
  prompts: WordPrompt[] = []
): StoryTextSegment[] {
  if (!templateText) return [];

  const promptMap = new Map<string, WordPrompt>();
  for (const p of prompts) {
    if (p?.id) {
      promptMap.set(p.id, p);
    }
  }

  const segments: StoryTextSegment[] = [];
  const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(templateText)) !== null) {
    const matchIndex = match.index;
    const placeholderId = match[1];

    // Text before the placeholder
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: templateText.slice(lastIndex, matchIndex),
      });
    }

    const rawWord = userWords?.[placeholderId];
    const prompt = promptMap.get(placeholderId);

    let displayWord = typeof rawWord === 'string' ? rawWord.trim() : '';
    if (!displayWord) {
      displayWord = prompt?.examples?.[0] || prompt?.label || `[${placeholderId}]`;
    }

    segments.push({
      type: 'word',
      content: displayWord,
      promptId: placeholderId,
      promptLabel: prompt ? prompt.label : 'Word',
    });

    lastIndex = regex.lastIndex;
  }

  // Remaining text after the last placeholder
  if (lastIndex < templateText.length) {
    segments.push({
      type: 'text',
      content: templateText.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Main entry point: Processes a complete story template and user words into a final story.
 */
export function generateCompletedStory(
  template: StoryTemplate,
  userWords: Record<string, string>
): StoryGenerationResult {
  if (!template || !template.templateText) {
    return {
      success: false,
      assembledText: '',
      segments: [],
      substitutedWordCount: 0,
      unresolvedPlaceholders: [],
      warnings: ['Invalid or missing story template.'],
    };
  }

  const prompts = template.prompts || [];
  const assembly = assembleStoryText(template.templateText, userWords, prompts);
  const segments = tokenizeStorySegments(template.templateText, userWords, prompts);

  // Final check: no {{...}} placeholders should remain in the assembled text
  const remainingCheck = verifyNoRemainingPlaceholders(assembly.assembledText);

  return {
    success: !remainingCheck.hasPlaceholders,
    assembledText: assembly.assembledText,
    segments,
    substitutedWordCount: assembly.substitutedWordCount,
    unresolvedPlaceholders: assembly.unresolvedPlaceholders,
    warnings: assembly.warnings,
  };
}
