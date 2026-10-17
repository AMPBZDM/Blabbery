import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StoryTextSegment } from '@/types/story';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { appHaptics } from '@/utils/haptics';
import { BookOpen } from 'lucide-react-native';

interface StoryReaderProps {
  title?: string;
  segments: StoryTextSegment[];
  onWordPress?: (word: string, promptLabel: string) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  title,
  segments,
  onWordPress,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const handleWordPress = (word: string, promptLabel: string) => {
    appHaptics.selection();
    if (onWordPress) {
      onWordPress(word, promptLabel);
    } else {
      Alert.alert(
        'Prompt Category:',
        `"${promptLabel}"\n\nEntered word: ${word}`
      );
    }
  };

  const baseFontSize = 17.5 * fontSizeMultiplier;
  const lineHeight = 30 * fontSizeMultiplier;

  // Handle invalid or missing data
  if (!segments || segments.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <BookOpen size={28} color={colors.textMuted} />
        <Text
          style={[
            styles.emptyText,
            { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier },
          ]}
        >
          The story text is not available.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Optional title header within card */}
      {title ? (
        <View style={[styles.titleHeader, { borderBottomColor: colors.cardBorder }]}>
          <Text
            style={[
              styles.storyTitle,
              {
                color: colors.text,
                fontSize: Typography.titleLarge.fontSize * fontSizeMultiplier,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      ) : null}

      {/* Main story text with embedded highlighted words */}
      <Text style={[styles.textBlock, { lineHeight }]}>
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return (
              <Text
                key={`text-${index}`}
                style={[
                  styles.plainText,
                  {
                    color: colors.text,
                    fontSize: baseFontSize,
                  },
                ]}
              >
                {segment.content}
              </Text>
            );
          }

          // Visually highlighted word (Blabbery substituted answer)
          return (
            <Text
              key={`word-${index}-${segment.promptId}`}
              onPress={() => handleWordPress(segment.content, segment.promptLabel)}
              accessibilityRole="button"
              accessibilityLabel={`Inserted word: ${segment.content}, prompt: ${segment.promptLabel}`}
              style={[
                styles.highlightedWord,
                {
                  color: colors.wordBadgeText,
                  backgroundColor: colors.wordBadgeBg,
                  fontSize: baseFontSize,
                },
              ]}
            >
              {` ${segment.content} `}
            </Text>
          );
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    marginVertical: Spacing.md,
    ...Shadows.card,
  },
  titleHeader: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  storyTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  textBlock: {
    flexWrap: 'wrap',
  },
  plainText: {
    fontWeight: '400',
  },
  highlightedWord: {
    fontWeight: '800',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  emptyText: {
    fontWeight: '600',
  },
});
