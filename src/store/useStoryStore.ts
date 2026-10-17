import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletedStory, StoryDraft } from '@/types/story';

export interface StoryState {
  completedStories: CompletedStory[];
  drafts: Record<string, StoryDraft>; // key: templateId
  favoriteTemplateIds: string[]; // key: templateId
  recentPlayedTemplateIds: string[]; // Recently played template IDs (chronological)

  // Actions
  addCompletedStory: (story: CompletedStory) => void;
  toggleFavorite: (storyId: string) => void;
  toggleFavoriteTemplate: (templateId: string) => void;
  deleteCompletedStory: (storyId: string) => void;
  saveDraft: (draft: StoryDraft) => void;
  clearDraft: (templateId: string) => void;
  clearAllDrafts: () => void;
  recordPlayedTemplate: (templateId: string) => void;
  clearRecentPlayed: () => void;
  clearAllCompleted: () => void;
  resetAllStoryData: () => void;
}

/**
 * Validates whether a persisted item is a valid CompletedStory object.
 */
function isValidCompletedStory(item: any): item is CompletedStory {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.templateId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.assembledText === 'string' &&
    typeof item.completedAt === 'string'
  );
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set) => ({
      completedStories: [],
      drafts: {},
      favoriteTemplateIds: [],
      recentPlayedTemplateIds: [],

      addCompletedStory: (newStory) =>
        set((state) => {
          if (!isValidCompletedStory(newStory)) return state;

          // If it already exists with this ID, replace it; otherwise prepend to the beginning
          const filtered = state.completedStories.filter((s) => s.id !== newStory.id);
          const updatedDrafts = { ...state.drafts };
          delete updatedDrafts[newStory.templateId];

          // Update recently played templates
          const recents = (state.recentPlayedTemplateIds || []).filter(
            (id) => id !== newStory.templateId
          );

          return {
            completedStories: [newStory, ...filtered],
            drafts: updatedDrafts,
            recentPlayedTemplateIds: [newStory.templateId, ...recents].slice(0, 10),
          };
        }),

      toggleFavorite: (storyId) =>
        set((state) => ({
          completedStories: state.completedStories.map((story) =>
            story.id === storyId ? { ...story, isFavorite: !story.isFavorite } : story
          ),
        })),

      toggleFavoriteTemplate: (templateId) =>
        set((state) => {
          if (!templateId || typeof templateId !== 'string') return state;
          const current = state.favoriteTemplateIds || [];
          const exists = current.includes(templateId);
          return {
            favoriteTemplateIds: exists
              ? current.filter((id) => id !== templateId)
              : [...current, templateId],
          };
        }),

      deleteCompletedStory: (storyId) =>
        set((state) => ({
          completedStories: state.completedStories.filter((s) => s.id !== storyId),
        })),

      saveDraft: (draft) =>
        set((state) => {
          if (!draft || !draft.templateId) return state;

          const recents = (state.recentPlayedTemplateIds || []).filter(
            (id) => id !== draft.templateId
          );

          return {
            drafts: {
              ...state.drafts,
              [draft.templateId]: draft,
            },
            recentPlayedTemplateIds: [draft.templateId, ...recents].slice(0, 10),
          };
        }),

      clearDraft: (templateId) =>
        set((state) => {
          const updatedDrafts = { ...state.drafts };
          delete updatedDrafts[templateId];
          return { drafts: updatedDrafts };
        }),

      clearAllDrafts: () =>
        set(() => ({
          drafts: {},
        })),

      recordPlayedTemplate: (templateId) =>
        set((state) => {
          if (!templateId || typeof templateId !== 'string') return state;
          const recents = (state.recentPlayedTemplateIds || []).filter(
            (id) => id !== templateId
          );
          return {
            recentPlayedTemplateIds: [templateId, ...recents].slice(0, 10),
          };
        }),

      clearRecentPlayed: () =>
        set(() => ({
          recentPlayedTemplateIds: [],
        })),

      clearAllCompleted: () =>
        set(() => ({
          completedStories: [],
        })),

      resetAllStoryData: () =>
        set(() => ({
          completedStories: [],
          drafts: {},
          favoriteTemplateIds: [],
          recentPlayedTemplateIds: [],
        })),
    }),
    {
      name: 'blabbery-story-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Sanitize and safely restore corrupted or missing persisted data
      merge: (persistedState: any, currentState: StoryState): StoryState => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }

        const validStories = Array.isArray(persistedState.completedStories)
          ? persistedState.completedStories.filter(isValidCompletedStory)
          : [];

        const validFavTemplates = Array.isArray(persistedState.favoriteTemplateIds)
          ? persistedState.favoriteTemplateIds.filter((id: any) => typeof id === 'string')
          : [];

        const validRecents = Array.isArray(persistedState.recentPlayedTemplateIds)
          ? persistedState.recentPlayedTemplateIds.filter((id: any) => typeof id === 'string')
          : [];

        const validDrafts =
          typeof persistedState.drafts === 'object' && persistedState.drafts !== null
            ? persistedState.drafts
            : {};

        return {
          ...currentState,
          completedStories: validStories,
          favoriteTemplateIds: validFavTemplates,
          recentPlayedTemplateIds: validRecents,
          drafts: validDrafts,
        };
      },
    }
  )
);
