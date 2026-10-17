import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CategoryDefinition, CATEGORY_DEFINITIONS } from '@/data/categories';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { appHaptics } from '@/utils/haptics';
import {
  Pizza,
  Compass,
  Rocket,
  Briefcase,
  Cat,
  Ghost,
  LayoutGrid,
} from 'lucide-react-native';

interface CategorySectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const renderCategoryIcon = (iconName: string) => {
    const size = 20;
    const color = colors.primary;
    switch (iconName) {
      case 'Pizza':
        return <Pizza size={size} color={color} />;
      case 'Compass':
        return <Compass size={size} color={color} />;
      case 'Rocket':
        return <Rocket size={size} color={color} />;
      case 'Briefcase':
        return <Briefcase size={size} color={color} />;
      case 'Cat':
        return <Cat size={size} color={color} />;
      case 'Ghost':
        return <Ghost size={size} color={color} />;
      default:
        return <LayoutGrid size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <LayoutGrid size={18} color={colors.primary} />
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: Typography.titleSmall.fontSize * fontSizeMultiplier,
              },
            ]}
          >
            Themes & Categories
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {CATEGORY_DEFINITIONS.map((cat: CategoryDefinition) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                appHaptics.selection();
                onSelectCategory(isSelected ? 'all' : cat.id);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${cat.label} category, ${count} stories`}
              style={({ pressed }) => [
                styles.categoryCard,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.card,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isSelected ? colors.card : colors.cardHover,
                  },
                ]}
              >
                {renderCategoryIcon(cat.iconName)}
              </View>

              <Text
                style={[
                  styles.catLabel,
                  {
                    color: colors.text,
                    fontSize: Typography.bodySemibold.fontSize * fontSizeMultiplier,
                  },
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>

              <Text
                style={[
                  styles.countText,
                  {
                    color: colors.textSecondary,
                    fontSize: 11 * fontSizeMultiplier,
                  },
                ]}
              >
                {count} stories
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    width: '31.5%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  catLabel: {
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  countText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
