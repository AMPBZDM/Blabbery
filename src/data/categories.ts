import { StoryCategory } from '@/types/story';

export interface CategoryDefinition {
  id: Exclude<StoryCategory, 'all'>;
  label: string;
  description: string;
  iconName: string;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'funny',
    label: 'Funny',
    description: 'Hilarious, absurd, and unexpected twists.',
    iconName: 'Pizza',
  },
  {
    id: 'adventure',
    label: 'Adventure',
    description: 'Brave heroes, enchanted forests, and epic quests.',
    iconName: 'Compass',
  },
  {
    id: 'scifi',
    label: 'Sci-Fi',
    description: 'Galactic starships, alien worlds, and rogue robots.',
    iconName: 'Rocket',
  },
  {
    id: 'school_work',
    label: 'School & Work',
    description: 'Chaotic classrooms and bizarre office shenanigans.',
    iconName: 'Briefcase',
  },
  {
    id: 'animals',
    label: 'Animals',
    description: 'Pets living secret lives and peculiar wild creatures.',
    iconName: 'Cat',
  },
  {
    id: 'spooky',
    label: 'Spooky',
    description: 'Midnight creaks, quirky ghouls, and friendly phantoms.',
    iconName: 'Ghost',
  },
];

export const ALL_CATEGORIES_FILTER = [
  { id: 'all' as StoryCategory, label: 'All' },
  ...CATEGORY_DEFINITIONS.map((c) => ({
    id: c.id as StoryCategory,
    label: c.label,
  })),
];
