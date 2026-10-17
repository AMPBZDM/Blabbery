import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StoryTemplate } from '@/types/story';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { AppBadge } from '@/components/common/Badge';
import { appHaptics } from '@/utils/haptics';
import {
  Clock,
  Sparkles,
  ChevronRight,
  Heart,
  Pizza,
  Rocket,
  Compass,
  Briefcase,
  Cat,
  Ghost,
  Car,
  BookOpen,
} from 'lucide-react-native';

interface StoryCardProps {
  template: StoryTemplate;
  hasDraft?: boolean;
  isFavorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  template,
  hasDraft = false,
  isFavorite = false,
  onPress,
  onToggleFavorite,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const handlePress = () => {
    appHaptics.selection();
    onPress();
  };

  const renderIcon = () => {
    const size = 22;
    const color = colors.primary;
    switch (template.iconName) {
      case 'Pizza':
        return <Pizza size={size} color={color} />;
      case 'Rocket':
        return <Rocket size={size} color={color} />;
      case 'Compass':
        return <Compass size={size} color={color} />;
      case 'Briefcase':
        return <Briefcase size={size} color={color} />;
      case 'Cat':
        return <Cat size={size} color={color} />;
      case 'Ghost':
        return <Ghost size={size} color={color} />;
      case 'Car':
        return <Car size={size} color={color} />;
      default:
        return <BookOpen size={size} color={color} />;
    }
  };

  const getCategoryLabel = () => {
    switch (template.category) {
      case 'funny':
        return 'Funny';
      case 'scifi':
        return 'Sci-Fi';
      case 'adventure':
        return 'Adventure';
      case 'school_work':
        return 'School & Work';
      case 'animals':
        return 'Animals';
      case 'spooky':
        return 'Spooky';
      default:
        return 'Story';
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={`${template.title}, ${getCategoryLabel()}, ${template.prompts.length} words, approximately ${template.estimatedMinutes} minutes`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: hasDraft ? colors.accent : colors.cardBorder,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          {renderIcon()}
        </View>

        <View style={styles.topRightActions}>
          <View style={styles.badgeRow}>
            {hasDraft && (
              <AppBadge
                label="Resume"
                variant="warning"
                size="sm"
              />
            )}
            <AppBadge label={getCategoryLabel()} variant="neutral" size="sm" />
          </View>

          {onToggleFavorite && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                appHaptics.selection();
                onToggleFavorite();
              }}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
              hitSlop={10}
              style={({ pressed }) => [
                styles.favoriteBtn,
                {
                  backgroundColor: isFavorite ? colors.dangerLight : colors.cardHover,
                  borderColor: isFavorite ? colors.danger : colors.cardBorder,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
            >
              <Heart
                size={18}
                color={isFavorite ? colors.danger : colors.textMuted}
                fill={isFavorite ? colors.danger : 'transparent'}
              />
            </Pressable>
          )}
        </View>
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: 17.5 * fontSizeMultiplier,
          },
        ]}
      >
        {template.title}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: 13.5 * fontSizeMultiplier,
          },
        ]}
        numberOfLines={2}
      >
        {template.description}
      </Text>

      <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Sparkles size={14} color={colors.textMuted} />
            <Text
              style={[
                styles.metaText,
                { color: colors.textSecondary, fontSize: 12 * fontSizeMultiplier },
              ]}
            >
              {template.prompts.length} words
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Clock size={14} color={colors.textMuted} />
            <Text
              style={[
                styles.metaText,
                { color: colors.textSecondary, fontSize: 12 * fontSizeMultiplier },
              ]}
            >
              ~{template.estimatedMinutes} min
            </Text>
          </View>
        </View>

        <ChevronRight size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    ...Shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  favoriteBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  description: {
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontWeight: '600',
  },
});
