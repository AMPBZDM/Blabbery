import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { DEFAULT_STORIES } from '@/data/defaultStories';
import { ALL_CATEGORIES_FILTER } from '@/data/categories';
import { StoryCategory, StoryTemplate } from '@/types/story';
import { StoryCard } from '@/components/story/StoryCard';
import { StoryDetailModal } from '@/components/story/StoryDetailModal';
import { SearchInput } from '@/components/common/SearchInput';
import { CategoryChip } from '@/components/common/CategoryChip';
import { AppBadge } from '@/components/common/Badge';
import { AppButton } from '@/components/common/Button';
import { HeroQuickPlay } from '@/components/home/HeroQuickPlay';
import { RecentStories } from '@/components/home/RecentStories';
import { CategorySection } from '@/components/home/CategorySection';
import { FavoritesBanner } from '@/components/home/FavoritesBanner';
import { useStoryStore } from '@/store/useStoryStore';
import { appHaptics } from '@/utils/haptics';
import {
  Settings,
  Sparkles,
  RotateCcw,
  BookOpen,
  Play,
  Heart,
  Search,
} from 'lucide-react-native';

const EMPTY_FAVORITE_IDS: string[] = [];

export default function HomeScreen() {
  const { colors, fontSizeMultiplier } = useTheme();
  const router = useRouter();

  const drafts = useStoryStore((s) => s.drafts);
  const clearDraft = useStoryStore((s) => s.clearDraft);
  const completedStories = useStoryStore((s) => s.completedStories);
  const favoriteTemplateIds = useStoryStore((s) => s.favoriteTemplateIds) ?? EMPTY_FAVORITE_IDS;
  const toggleFavoriteTemplate = useStoryStore((s) => s.toggleFavoriteTemplate);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedStoryForDetail, setSelectedStoryForDetail] = useState<StoryTemplate | null>(null);

  // Calculate count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: DEFAULT_STORIES.length };
    for (const story of DEFAULT_STORIES) {
      counts[story.category] = (counts[story.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered stories list
  const filteredStories = useMemo(() => {
    return DEFAULT_STORIES.filter((story) => {
      const matchesCategory =
        selectedCategory === 'all' || story.category === selectedCategory;
      const matchesFavorites = !onlyFavorites || favoriteTemplateIds.includes(story.id);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        story.title.toLowerCase().includes(query) ||
        story.description.toLowerCase().includes(query);
      return matchesCategory && matchesFavorites && matchesSearch;
    });
  }, [searchQuery, selectedCategory, onlyFavorites, favoriteTemplateIds]);

  // Check for the most recent active draft
  const activeDraft = useMemo(() => {
    const draftKeys = Object.keys(drafts);
    if (draftKeys.length === 0) return null;
    const latestTemplateId = draftKeys[0];
    const draft = drafts[latestTemplateId];
    const template = DEFAULT_STORIES.find((t) => t.id === latestTemplateId);
    return template && draft ? { template, draft } : null;
  }, [drafts]);

  // Count of favorite completed stories
  const favoriteCount = useMemo(() => {
    return completedStories.filter((s) => s.isFavorite).length;
  }, [completedStories]);

  // Launch quick random game
  const handleQuickPlay = () => {
    appHaptics.medium();
    const randomIndex = Math.floor(Math.random() * DEFAULT_STORIES.length);
    const randomStory = DEFAULT_STORIES[randomIndex];
    router.push({
      pathname: '/story/[id]',
      params: { id: randomStory.id },
    });
  };

  const handleSelectStory = (storyId: string) => {
    router.push({
      pathname: '/story/[id]',
      params: { id: storyId },
    });
  };

  const handleOpenCompletedStory = (storyId: string) => {
    router.push({
      pathname: '/result/[id]',
      params: { id: storyId },
    });
  };

  const handleClearDraft = (templateId: string) => {
    appHaptics.medium();
    clearDraft(templateId);
  };

  const handleOpenSettings = () => {
    appHaptics.light();
    router.push('/(tabs)/settings');
  };

  const handleOpenFavorites = () => {
    appHaptics.light();
    router.push({
      pathname: '/(tabs)/library',
      params: { filter: 'favorites' },
    });
  };

  const handleViewLibrary = () => {
    appHaptics.light();
    router.push('/(tabs)/library');
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Header: Branding, Title, and Settings Button */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View
              style={[
                styles.logoWrap,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Sparkles size={20} color={colors.primary} />
            </View>
            <View>
              <Text
                style={[
                  styles.brandTitle,
                  {
                    color: colors.text,
                    fontSize: Typography.titleLarge.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                Blabbery
              </Text>
              <Text
                style={[
                  styles.brandSubtitle,
                  {
                    color: colors.textSecondary,
                    fontSize: 12.5 * fontSizeMultiplier,
                  },
                ]}
              >
                Fun Fill-in Story Game
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleOpenSettings}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={8}
            style={({ pressed }) => [
              styles.settingsBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Settings size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* 2. Prominent Quick Play CTA (Hero) */}
        <HeroQuickPlay
          onQuickPlay={handleQuickPlay}
          totalStoriesCount={DEFAULT_STORIES.length}
        />

        {/* 3. In-progress Draft (if present) */}
        {activeDraft && (
          <View
            style={[
              styles.draftCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.accent,
              },
            ]}
          >
            <View style={styles.draftTopRow}>
              <AppBadge label="Draft in progress" variant="warning" size="sm" />
              <Pressable
                onPress={() => handleClearDraft(activeDraft.template.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Discard draft"
                style={styles.discardBtn}
              >
                <RotateCcw size={13} color={colors.textMuted} />
                <Text style={[styles.discardText, { color: colors.textMuted }]}>
                  Discard
                </Text>
              </Pressable>
            </View>

            <Text
              style={[
                styles.draftTitle,
                {
                  color: colors.text,
                  fontSize: Typography.titleSmall.fontSize * fontSizeMultiplier,
                },
              ]}
            >
              {activeDraft.template.title}
            </Text>

            <Text
              style={[
                styles.draftSubtext,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.caption.fontSize * fontSizeMultiplier,
                },
              ]}
            >
              {activeDraft.draft.currentStepIndex + 1} of{' '}
              {activeDraft.template.prompts.length} words entered
            </Text>

            <AppButton
              title="Resume Story"
              onPress={() => handleSelectStory(activeDraft.template.id)}
              variant="primary"
              size="sm"
              icon={<Play size={14} color="#FFFFFF" />}
              style={styles.resumeBtn}
            />
          </View>
        )}

        {/* 4. Favorites Banner (if favorites exist) */}
        <FavoritesBanner
          favoriteCount={favoriteCount}
          onViewFavorites={handleOpenFavorites}
        />

        {/* 5. Recent Stories History (if completed history exists) */}
        <RecentStories
          stories={completedStories}
          onOpenStory={handleOpenCompletedStory}
          onViewLibrary={handleViewLibrary}
        />

        {/* 6. Story Categories */}
        <CategorySection
          selectedCategory={onlyFavorites ? '' : selectedCategory}
          onSelectCategory={(id) => {
            setOnlyFavorites(false);
            setSelectedCategory(id as StoryCategory);
          }}
          categoryCounts={categoryCounts}
        />

        {/* 7. Search & Story Catalog Section */}
        <View style={styles.catalogSection}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: Typography.titleSmall.fontSize * fontSizeMultiplier,
                },
              ]}
            >
              {onlyFavorites
                ? `Favorite Stories (${filteredStories.length})`
                : selectedCategory !== 'all'
                ? `${
                    ALL_CATEGORIES_FILTER.find((c) => c.id === selectedCategory)?.label ||
                    'Stories'
                  } (${filteredStories.length})`
                : `All Stories (${filteredStories.length})`}
            </Text>
          </View>

          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by title or description..."
            style={styles.searchBar}
          />

          {/* Horizontal category selector bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Favorites filter chip */}
            <CategoryChip
              key="favorites-filter"
              label="Favorites"
              isSelected={onlyFavorites}
              count={favoriteTemplateIds.length}
              onPress={() => {
                appHaptics.selection();
                setOnlyFavorites((prev) => !prev);
              }}
            />

            {ALL_CATEGORIES_FILTER.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.label}
                isSelected={!onlyFavorites && selectedCategory === cat.id}
                count={categoryCounts[cat.id]}
                onPress={() => {
                  setOnlyFavorites(false);
                  setSelectedCategory(cat.id);
                }}
              />
            ))}
          </ScrollView>

          {/* Story catalog list */}
          <View style={styles.storyList}>
            {filteredStories.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyIconWrap,
                    { backgroundColor: colors.cardHover },
                  ]}
                >
                  {onlyFavorites ? (
                    <Heart size={30} color={colors.danger} />
                  ) : searchQuery.trim().length > 0 ? (
                    <Search size={30} color={colors.textMuted} />
                  ) : (
                    <BookOpen size={30} color={colors.textMuted} />
                  )}
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    {
                      color: colors.text,
                      fontSize: Typography.titleSmall.fontSize * fontSizeMultiplier,
                    },
                  ]}
                >
                  {onlyFavorites
                    ? 'No favorite stories'
                    : searchQuery.trim().length > 0
                    ? 'No stories found'
                    : 'No stories in this category'}
                </Text>
                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: colors.textSecondary,
                      fontSize: Typography.bodyMedium.fontSize * fontSizeMultiplier,
                    },
                  ]}
                >
                  {onlyFavorites
                    ? 'Mark stories with the heart icon in the catalog for quick access!'
                    : searchQuery.trim().length > 0
                    ? `No matches found for "${searchQuery}".`
                    : 'No templates found in this theme. Try picking another category!'}
                </Text>
                <AppButton
                  title="Reset filters"
                  variant="secondary"
                  size="sm"
                  style={{ marginTop: Spacing.md }}
                  onPress={() => {
                    appHaptics.light();
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setOnlyFavorites(false);
                  }}
                />
              </View>
            ) : (
              filteredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  template={story}
                  hasDraft={!!drafts[story.id]}
                  isFavorite={favoriteTemplateIds.includes(story.id)}
                  onPress={() => setSelectedStoryForDetail(story)}
                  onToggleFavorite={() => toggleFavoriteTemplate(story.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Story Detail Modal */}
      <StoryDetailModal
        template={selectedStoryForDetail}
        visible={!!selectedStoryForDetail}
        isFavorite={
          !!selectedStoryForDetail &&
          favoriteTemplateIds.includes(selectedStoryForDetail.id)
        }
        hasDraft={
          !!selectedStoryForDetail && !!drafts[selectedStoryForDetail.id]
        }
        onClose={() => setSelectedStoryForDetail(null)}
        onStartStory={(templateId) => {
          setSelectedStoryForDetail(null);
          handleSelectStory(templateId);
        }}
        onToggleFavorite={(templateId) => {
          toggleFavoriteTemplate(templateId);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontWeight: '600',
    marginTop: 1,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginBottom: Spacing.xl,
  },
  draftTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  discardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  draftTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  draftSubtext: {
    marginBottom: Spacing.md,
  },
  resumeBtn: {
    alignSelf: 'flex-start',
  },
  catalogSection: {
    marginTop: Spacing.sm,
  },
  sectionHeaderRow: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  searchBar: {
    marginBottom: Spacing.md,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  storyList: {
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
