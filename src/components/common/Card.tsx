import React from 'react';
import {
  View,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { appHaptics } from '@/utils/haptics';

export type CardVariant = 'bordered' | 'elevated' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const AppCard: React.FC<CardProps> = ({
  children,
  variant = 'bordered',
  padding = 'md',
  onPress,
  style,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.xl;
      case 'md':
      default:
        return Spacing.lg;
    }
  };

  const getCardStyle = (pressed?: boolean) => {
    const base: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: getPadding(),
    };

    if (variant === 'bordered') {
      base.borderWidth = 1;
      base.borderColor = colors.cardBorder;
    } else if (variant === 'elevated') {
      base.borderWidth = 1;
      base.borderColor = colors.cardBorder;
      Object.assign(base, Shadows.card);
    } else if (variant === 'flat') {
      base.backgroundColor = colors.cardHover;
    }

    if (pressed) {
      base.transform = [{ scale: 0.985 }];
    }

    return base;
  };

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          appHaptics.selection();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [getCardStyle(pressed), style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
