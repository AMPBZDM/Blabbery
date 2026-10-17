import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { appShare } from './share';
import { useStoryStore } from '@/store/useStoryStore';

describe('Story Actions Suite (Share, Clipboard, Replay, Favorites)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStoryStore.getState().resetAllStoryData();
  });

  describe('1. Native Share (shareText)', () => {
    test('shares the complete story including title and assembled text', async () => {
      const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({
        action: Share.sharedAction,
      });

      const title = 'The Disastrous Pizza Delivery';
      const text = 'Bob delivered the cold pizza to the spaceship.';

      const result = await appShare.shareText(title, text);

      expect(shareSpy).toHaveBeenCalledTimes(1);
      const callArg = shareSpy.mock.calls[0][0];

      expect(callArg.title).toBe(title);
      expect(callArg.message).toContain(title);
      expect(callArg.message).toContain(text);
      expect(result.success).toBe(true);
    });

    test('handles user cancelling the share dialog', async () => {
      jest.spyOn(Share, 'share').mockResolvedValue({
        action: Share.dismissedAction,
      });

      const result = await appShare.shareText('Title', 'Text');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Share cancelled.');
    });

    test('handles exceptions during native sharing', async () => {
      jest.spyOn(Share, 'share').mockRejectedValue(new Error('Failed to share'));

      const result = await appShare.shareText('Title', 'Text');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to share');
    });
  });

  describe('2. Clipboard Copy (copyToClipboard)', () => {
    test('copies complete story (title and text) to clipboard', async () => {
      const copySpy = jest.spyOn(Clipboard, 'setStringAsync');

      const title = 'The Brave Cat';
      const text = 'Whiskers defeated the red laser dot in the living room.';

      const result = await appShare.copyToClipboard(title, text);

      expect(copySpy).toHaveBeenCalledTimes(1);
      const copiedText = (copySpy.mock.calls[0] as unknown as string[])[0];

      expect(copiedText).toContain(title);
      expect(copiedText).toContain(text);
      expect(result.success).toBe(true);
    });

    test('handles clipboard copy failure', async () => {
      jest
        .spyOn(Clipboard, 'setStringAsync')
        .mockRejectedValue(new Error('Clipboard error'));

      const result = await appShare.copyToClipboard('Title', 'Text');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Clipboard error');
    });
  });

  describe('3. Image Sharing (shareImage)', () => {
    test('successfully shares image when supported by device', async () => {
      jest.spyOn(Sharing, 'isAvailableAsync').mockResolvedValue(true);
      const shareAsyncSpy = jest.spyOn(Sharing, 'shareAsync');

      const result = await appShare.shareImage('file:///test-card.png');

      expect(shareAsyncSpy).toHaveBeenCalledWith('file:///test-card.png', {
        mimeType: 'image/png',
        dialogTitle: 'Share story image',
      });
      expect(result.success).toBe(true);
    });

    test('reports error when image sharing is not supported on device', async () => {
      jest.spyOn(Sharing, 'isAvailableAsync').mockResolvedValue(false);

      const result = await appShare.shareImage('file:///test-card.png');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Image sharing is not supported on this device.');
    });
  });

  describe('4. Favorite Original Template from Result Screen', () => {
    test('successfully adds original story template to favorites', () => {
      const templateId = 'story-pizza-courier';

      expect(useStoryStore.getState().favoriteTemplateIds).not.toContain(templateId);

      // Favorite template from result screen action
      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).toContain(templateId);

      // Second toggle removes it
      useStoryStore.getState().toggleFavoriteTemplate(templateId);
      expect(useStoryStore.getState().favoriteTemplateIds).not.toContain(templateId);
    });
  });

  describe('5. Restart and Replay State', () => {
    test('replaying with new words provides clean slate (deletes draft)', () => {
      const templateId = 'story-spaceship';

      // Existing draft
      useStoryStore.getState().saveDraft({
        templateId,
        currentStepIndex: 4,
        enteredWords: { p1: 'old word' },
        updatedAt: '2026-10-13T10:00:00Z',
      });

      expect(useStoryStore.getState().drafts[templateId]).toBeDefined();

      // Replay with new words clears the draft
      useStoryStore.getState().clearDraft(templateId);
      expect(useStoryStore.getState().drafts[templateId]).toBeUndefined();
    });

    test('restarting with existing words resets draft to step 0 while preserving words', () => {
      const templateId = 'story-spaceship';
      const existingWords = { p1: 'bouncing', p2: 'rocket' };

      // Save restart state
      useStoryStore.getState().saveDraft({
        templateId,
        currentStepIndex: 0,
        enteredWords: existingWords,
        updatedAt: new Date().toISOString(),
      });

      const draft = useStoryStore.getState().drafts[templateId];
      expect(draft).toBeDefined();
      expect(draft.currentStepIndex).toBe(0);
      expect(draft.enteredWords).toEqual(existingWords);
    });
  });
});
