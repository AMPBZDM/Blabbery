import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useStoryStore } from '@/store/useStoryStore';
import { AppButton } from '@/components/common/Button';
import { appShare } from '@/services/share';
import { appHaptics } from '@/utils/haptics';
import {
  Heart,
  Trash2,
  Share2,
  BookOpen,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';

export default function LibraryScreen() {
  const { colors, fontSizeMultiplier } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: 'all' | 'favorites' }>();

  const completedStories = useStoryStore((s) => s.completedStories);
  const toggleFavorite = useStoryStore((s) => s.toggleFavorite);
  const deleteStory = useStoryStore((s) => s.deleteCompletedStory);
  const clearAllCompleted = useStoryStore((s) => s.clearAllCompleted);

  const [userFilter, setUserFilter] = useState<'all' | 'favorites' | null>(null);
  const filter: 'all' | 'favorites' =
    userFilter ?? (params.filter === 'favorites' ? 'favorites' : 'all');

  const filteredStories = useMemo(() => {
    if (filter === 'favorites') {
      return completedStories.filter((s) => s.isFavorite);
    }
    return completedStories;
  }, [completedStories, filter]);

  const handleOpenStory = (storyId: string) => {
    router.push({
      pathname: '/result/[id]',
      params: { id: storyId },
    });
  };

  const handleDelete = (storyId: string, title: string) => {
    appHaptics.medium();
    Alert.alert(
      'Delete Story',
      `Are you sure you want to delete "${title}" from your saved stories?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteStory(storyId);
            appHaptics.light();
          },
        },
      ]
    );
  };

  const handleClearAllHistory = () => {
    appHaptics.medium();
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all saved stories from your library? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearAllCompleted();
            appHaptics.success();
          },
        },
      ]
    );
  };

  const handleShare = (title: string, text: string) => {
    appHaptics.light();
    appShare.shareText(title, text);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text
              style={[
                styles.title,
                { color: colors.text, fontSize: 26 * fontSizeMultiplier },
              ]}
            >
              Library
            </Text>

            {completedStories.length > 0 && (
              <Pressable
                onPress={handleClearAllHistory}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear all history"
                style={styles.clearAllBtn}
              >
                <Trash2 size={16} color={colors.danger} />
                <Text
                  style={[
                    styles.clearAllText,
                    { color: colors.danger, fontSize: 13 * fontSizeMultiplier },
                  ]}
                >
                  Clear History
                </Text>
              </Pressable>
            )}
          </View>

          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier },
            ]}
          >
            Here you will find your previously completed, fun stories.
          </Text>
        </View>

        {/* Tab Switcher: All vs Favorites */}
        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Pressable
            onPress={() => {
              appHaptics.selection();
              setUserFilter('all');
            }}
            style={[
              styles.segmentBtn,
              filter === 'all' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: filter === 'all' ? '#FFFFFF' : colors.textSecondary,
                  fontSize: 13 * fontSizeMultiplier,
                },
              ]}
            >
              All ({completedStories.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              appHaptics.selection();
              setUserFilter('favorites');
            }}
            style={[
              styles.segmentBtn,
              filter === 'favorites' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: filter === 'favorites' ? '#FFFFFF' : colors.textSecondary,
                  fontSize: 13 * fontSizeMultiplier,
                },
              ]}
            >
              Favorites ({completedStories.filter((s) => s.isFavorite).length})
            </Text>
          </Pressable>
        </View>

        {/* Story list or empty state */}
        {filteredStories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <BookOpen size={36} color={colors.primary} />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text, fontSize: 18 * fontSizeMultiplier },
              ]}
            >
              {filter === 'favorites'
                ? 'You have no favorite stories yet.'
                : "You haven't completed any stories yet."}
            </Text>
            <Text
              style={[
                styles.emptyDesc,
                { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier },
              ]}
            >
              Pick an exciting story from the catalog and fill it with words!
            </Text>
            <AppButton
              title="Explore Stories"
              onPress={() => router.push('/(tabs)')}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          filteredStories.map((story) => (
            <Pressable
              key={story.id}
              onPress={() => handleOpenStory(story.id)}
              style={({ pressed }) => [
                styles.storyItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.dateRow}>
                  <Calendar size={13} color={colors.textMuted} />
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: colors.textMuted,
                        fontSize: 12 * fontSizeMultiplier,
                      },
                    ]}
                  >
                    {formatDate(story.completedAt)}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    appHaptics.light();
                    toggleFavorite(story.id);
                  }}
                  style={styles.iconBtn}
                >
                  <Heart
                    size={20}
                    color={story.isFavorite ? colors.danger : colors.textMuted}
                    fill={story.isFavorite ? colors.danger : 'transparent'}
                  />
                </Pressable>
              </View>

              <Text
                style={[
                  styles.storyTitle,
                  { color: colors.text, fontSize: 17 * fontSizeMultiplier },
                ]}
              >
                {story.title}
              </Text>

              <Text
                style={[
                  styles.storySnippet,
                  {
                    color: colors.textSecondary,
                    fontSize: 13.5 * fontSizeMultiplier,
                  },
                ]}
                numberOfLines={2}
              >
                {story.assembledText}
              </Text>

              <View
                style={[
                  styles.cardActions,
                  { borderTopColor: colors.cardBorder },
                ]}
              >
                <View style={styles.actionLeft}>
                  <Pressable
                    onPress={() => handleShare(story.title, story.assembledText)}
                    style={styles.actionBtn}
                  >
                    <Share2 size={16} color={colors.primary} />
                    <Text
                      style={[
                        styles.actionBtnText,
                        {
                          color: colors.primary,
                          fontSize: 13 * fontSizeMultiplier,
                        },
                      ]}
                    >
                      Share
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDelete(story.id, story.title)}
                    style={styles.actionBtn}
                  >
                    <Trash2 size={16} color={colors.danger} />
                    <Text
                      style={[
                        styles.actionBtnText,
                        {
                          color: colors.danger,
                          fontSize: 13 * fontSizeMultiplier,
                        },
                      ]}
                    >
                      Delete
                    </Text>
                  </Pressable>
                </View>

                <ChevronRight size={18} color={colors.primary} />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontWeight: '700',
  },
  title: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  segmentText: {
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    textAlign: 'center',
    lineHeight: 20,
  },
  storyItem: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontWeight: '600',
  },
  iconBtn: {
    padding: 4,
  },
  storyTitle: {
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  storySnippet: {
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  actionBtnText: {
    fontWeight: '700',
  },
});
