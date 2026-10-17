import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { CompletedStory } from '@/types/story';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { AppBadge } from '@/components/common/Badge';
import { appHaptics } from '@/utils/haptics';
import { History, ChevronRight, BookOpen } from 'lucide-react-native';

interface RecentStoriesProps {
  stories: CompletedStory[];
  onOpenStory: (id: string) => void;
  onViewLibrary: () => void;
}

export const RecentStories: React.FC<RecentStoriesProps> = ({
  stories,
  onOpenStory,
  onViewLibrary,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  if (stories.length === 0) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <History size={18} color={colors.primary} />
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: Typography.titleSmall.fontSize * fontSizeMultiplier,
              },
            ]}
          >
            Recently Played Stories
          </Text>
        </View>

        <Pressable
          onPress={() => {
            appHaptics.selection();
            onViewLibrary();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View all saved stories in library"
          style={styles.seeAllBtn}
        >
          <Text
            style={[
              styles.seeAllText,
              { color: colors.primary, fontSize: 13 * fontSizeMultiplier },
            ]}
          >
            Library
          </Text>
          <ChevronRight size={14} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {stories.slice(0, 4).map((story) => (
          <Pressable
            key={story.id}
            onPress={() => {
              appHaptics.selection();
              onOpenStory(story.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${story.title}, read story`}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.cardTop}>
              <AppBadge label={formatDate(story.completedAt)} variant="neutral" size="sm" />
              <BookOpen size={16} color={colors.textMuted} />
            </View>

            <Text
              style={[
                styles.storyTitle,
                {
                  color: colors.text,
                  fontSize: Typography.bodySemibold.fontSize * fontSizeMultiplier,
                },
              ]}
              numberOfLines={1}
            >
              {story.title}
            </Text>

            <Text
              style={[
                styles.storySnippet,
                {
                  color: colors.textSecondary,
                  fontSize: 12.5 * fontSizeMultiplier,
                },
              ]}
              numberOfLines={2}
            >
              {story.assembledText}
            </Text>

            <View style={styles.cardFooter}>
              <Text
                style={[
                  styles.readText,
                  { color: colors.primary, fontSize: 12 * fontSizeMultiplier },
                ]}
              >
                Read again
              </Text>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  seeAllText: {
    fontWeight: '700',
  },
  scrollList: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  card: {
    width: 220,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.subtle,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  storyTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  storySnippet: {
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 'auto',
  },
  readText: {
    fontWeight: '700',
  },
});
