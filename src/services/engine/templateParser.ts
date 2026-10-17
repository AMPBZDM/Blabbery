import { StoryTextSegment, WordPrompt } from '@/types/story';
import {
  assembleStoryText,
  tokenizeStorySegments,
} from './storyGenerator';

/**
 * Substitutes {{word_id}} tokens with user-provided words and returns assembled plain text.
 */
export function assembleRawText(
  templateText: string,
  userWords: Record<string, string>,
  prompts: WordPrompt[] = []
): string {
  const result = assembleStoryText(templateText, userWords, prompts);
  return result.assembledText;
}

/**
 * Tokenizes the template into segments so the UI can format and highlight
 * user-provided words differently from regular story text.
 */
export function parseStorySegments(
  templateText: string,
  userWords: Record<string, string>,
  prompts: WordPrompt[] = []
): StoryTextSegment[] {
  return tokenizeStorySegments(templateText, userWords, prompts);
}

export * from './storyGenerator';
