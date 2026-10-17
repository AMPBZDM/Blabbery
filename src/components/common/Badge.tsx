import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppBadge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.secondaryLight,
          text: colors.secondary,
          border: 'transparent',
        };
      case 'neutral':
        return {
          bg: colors.cardHover,
          text: colors.textSecondary,
          border: colors.cardBorder,
        };
      case 'success':
        return {
          bg: colors.successLight,
          text: colors.success,
          border: 'transparent',
        };
      case 'warning':
        return {
          bg: colors.accentLight,
          text: colors.accent,
          border: 'transparent',
        };
      case 'danger':
        return {
          bg: colors.dangerLight,
          text: colors.danger,
          border: 'transparent',
        };
      case 'primary':
      default:
        return {
          bg: colors.primaryLight,
          text: colors.primary,
          border: 'transparent',
        };
    }
  };

  const scheme = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          borderWidth: scheme.border !== 'transparent' ? 1 : 0,
          paddingHorizontal: isSm ? Spacing.sm : Spacing.md,
          paddingVertical: isSm ? 2 : 4,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: scheme.text,
            fontSize: (isSm ? 10.5 : 11.5) * fontSizeMultiplier,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
