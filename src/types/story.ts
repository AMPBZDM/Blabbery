export type WordFieldType =
  | 'noun'          // noun
  | 'adjective'     // adjective
  | 'verb'          // verb
  | 'person_name'   // person name
  | 'location'      // place / location
  | 'general'       // general word
  | 'food'          // food / drink
  | 'animal'        // animal
  | 'number'        // number
  | 'exclamation';  // exclamation

// Compatibility alias for existing references
export type WordCategoryType = WordFieldType | 'proper_noun' | 'custom' | 'adverb';

export interface WordPrompt {
  id: string;                    // Unique identifier within template, e.g. "p_name"
  label: string;                 // Display label, e.g. "A person's name"
  instruction?: string;          // Optional instruction
  type: WordFieldType;           // Word field type (noun, adjective, verb, etc.)
  category?: WordCategoryType;   // Category alias for word bank suggestions
  hint?: string;                 // Helpful hint, e.g. "e.g. Peter, Sarah, Charlie"
  examples: string[];            // Built-in word bank suggestions
  isRequired?: boolean;          // Whether input is required (default: true)
}

export type StoryCategory =
  | 'all'
  | 'funny'
  | 'adventure'
  | 'scifi'
  | 'spooky'
  | 'school_work'
  | 'animals';

export interface StoryMetadata {
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  iconName: string;
  author: string;
  tags: string[];
}

export interface StoryTemplate {
  id: string;                            // Unique story identifier, e.g. "story-pizza-courier"
  title: string;                         // Title, e.g. "The Catastrophic Pizza Delivery"
  category: Exclude<StoryCategory, 'all'>; // Category
  language: string;                      // Language code, e.g. "en"
  description: string;                   // Short summary / introductory description
  templateText: string;                  // Template text containing {{id}} placeholders
  prompts: WordPrompt[];                 // Array of fillable prompts
  metadata: StoryMetadata;               // Additional metadata
  // Convenience aliases for existing views
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  iconName: string;
}

export interface CompletedStory {
  id: string;
  templateId: string;
  title: string;
  category: Exclude<StoryCategory, 'all'>;
  completedAt: string; // ISO string
  userWords: Record<string, string>;
  assembledText: string;
  isFavorite: boolean;
}

export interface StoryDraft {
  templateId: string;
  currentStepIndex: number;
  enteredWords: Record<string, string>;
  updatedAt: string;
}

export interface AppSettings {
  themeMode: 'system' | 'light' | 'dark';
  fontSizeMultiplier: number;
  hapticEnabled: boolean;
  ttsRate: number;
  showWordSuggestions: boolean;
}

export type StoryTextSegment =
  | { type: 'text'; content: string }
  | { type: 'word'; content: string; promptId: string; promptLabel: string };
