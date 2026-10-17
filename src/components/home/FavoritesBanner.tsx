import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { appHaptics } from '@/utils/haptics';
import { Heart, ChevronRight } from 'lucide-react-native';

interface FavoritesBannerProps {
  favoriteCount: number;
  onViewFavorites: () => void;
}

export const FavoritesBanner: React.FC<FavoritesBannerProps> = ({
  favoriteCount,
  onViewFavorites,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  if (favoriteCount === 0) return null;

  return (
    <Pressable
      onPress={() => {
        appHaptics.selection();
        onViewFavorites();
      }}
      accessibilityRole="button"
      accessibilityLabel={`Favorite stories, ${favoriteCount} saved stories`}
      style={({ pressed }) => [
        styles.banner,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.dangerLight }]}>
        <Heart size={20} color={colors.danger} fill={colors.danger} />
      </View>

      <View style={styles.textWrap}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: Typography.bodySemibold.fontSize * fontSizeMultiplier,
            },
          ]}
        >
          Your Favorite Stories ({favoriteCount})
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: 12.5 * fontSizeMultiplier,
            },
          ]}
        >
          Tap here to quickly view your saved stories!
        </Text>
      </View>

      <ChevronRight size={18} color={colors.primary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontWeight: '500',
  },
});
