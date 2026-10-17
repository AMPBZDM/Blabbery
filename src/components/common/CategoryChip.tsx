import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { appHaptics } from '@/utils/haptics';

interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  count?: number;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  isSelected,
  onPress,
  count,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const handlePress = () => {
    appHaptics.selection();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${label}${count !== undefined ? `, ${count} ${count === 1 ? 'story' : 'stories'}` : ''}`}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : colors.card,
          borderColor: isSelected ? colors.primary : colors.cardBorder,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isSelected ? '#FFFFFF' : colors.text,
            fontSize: 13 * fontSizeMultiplier,
            fontWeight: isSelected ? '700' : '600',
          },
        ]}
      >
        {label}
        {count !== undefined && count > 0 ? ` (${count})` : ''}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    letterSpacing: 0.2,
  },
});
