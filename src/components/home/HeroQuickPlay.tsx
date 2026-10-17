import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { AppButton } from '@/components/common/Button';
import { Dices, Sparkles } from 'lucide-react-native';

interface HeroQuickPlayProps {
  onQuickPlay: () => void;
  totalStoriesCount: number;
}

export const HeroQuickPlay: React.FC<HeroQuickPlayProps> = ({
  onQuickPlay,
  totalStoriesCount,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.sparkleIcon, { backgroundColor: colors.primaryLight }]}>
          <Sparkles size={20} color={colors.primary} />
        </View>
        <Text
          style={[
            styles.badgeText,
            { color: colors.primary, fontSize: 11 * fontSizeMultiplier },
          ]}
        >
          {totalStoriesCount} STORIES AVAILABLE
        </Text>
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: Typography.titleLarge.fontSize * fontSizeMultiplier,
          },
        ]}
      >
        Ready for a laugh?
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: Typography.bodyMedium.fontSize * fontSizeMultiplier,
          },
        ]}
      >
        Start a game now: pick a random story, fill in the words, and read the hilarious result!
      </Text>

      <AppButton
        title="Quick Play (Random Story)"
        onPress={onQuickPlay}
        variant="primary"
        size="md"
        fullWidth
        icon={<Dices size={18} color="#FFFFFF" />}
        accessibilityLabel="Start a new game with a random story"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  sparkleIcon: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  description: {
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
});
