import { Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

export interface ShareResult {
  success: boolean;
  message?: string;
}

export const appShare = {
  /**
   * Shares the full story (title and text) via the system native share dialogue.
   */
  shareText: async (title: string, text: string): Promise<ShareResult> => {
    try {
      const formattedMessage = `✨ ${title} ✨\n\n${text}\n\nCreated with Blabbery! 🎉`;
      const result = await Share.share({
        title,
        message: formattedMessage,
      });

      if (result.action === Share.sharedAction) {
        return { success: true };
      }
      return { success: false, message: 'Share cancelled.' };
    } catch (error: any) {
      console.warn('Text share error:', error);
      return {
        success: false,
        message: error?.message || 'Could not open share menu.',
      };
    }
  },

  /**
   * Copies story title and full text to clipboard.
   */
  copyToClipboard: async (title: string, text: string): Promise<ShareResult> => {
    try {
      const formattedContent = `${title}\n\n${text}\n\nCreated with Blabbery! 🎉`;
      await Clipboard.setStringAsync(formattedContent);
      return { success: true };
    } catch (error: any) {
      console.warn('Clipboard copy error:', error);
      return {
        success: false,
        message: error?.message || 'Could not copy text to clipboard.',
      };
    }
  },

  /**
   * Shares a generated image card (e.g. view-shot URI).
   */
  shareImage: async (uri: string): Promise<ShareResult> => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          message: 'Image sharing is not supported on this device.',
        };
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share story image',
      });
      return { success: true };
    } catch (error: any) {
      console.warn('Image share error:', error);
      return {
        success: false,
        message: error?.message || 'Could not share image.',
      };
    }
  },
};
