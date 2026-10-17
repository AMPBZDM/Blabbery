import { StoryTemplate } from '@/types/story';
import { FUNNY_STORIES } from './funnyStories';
import { SCIFI_STORIES } from './scifiStories';
import { ADVENTURE_STORIES } from './adventureStories';
import { SCHOOL_WORK_STORIES } from './schoolWorkStories';
import { ANIMALS_STORIES } from './animalsStories';
import { SPOOKY_STORIES } from './spookyStories';

export const ALL_STORIES: StoryTemplate[] = [
  ...FUNNY_STORIES,
  ...SCIFI_STORIES,
  ...ADVENTURE_STORIES,
  ...SCHOOL_WORK_STORIES,
  ...ANIMALS_STORIES,
  ...SPOOKY_STORIES,
];

export {
  FUNNY_STORIES,
  SCIFI_STORIES,
  ADVENTURE_STORIES,
  SCHOOL_WORK_STORIES,
  ANIMALS_STORIES,
  SPOOKY_STORIES,
};
