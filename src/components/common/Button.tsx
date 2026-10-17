import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { appHaptics } from '@/utils/haptics';
import { BorderRadius, Spacing, MinTouchTarget } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  style,
  textStyle,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    appHaptics.light();
    onPress();
  };

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return colors.cardBorder;
    switch (variant) {
      case 'primary':
        return pressed ? colors.primaryDark : colors.primary;
      case 'secondary':
        return pressed ? colors.primaryLight : colors.cardHover;
      case 'outline':
        return pressed ? colors.cardHover : 'transparent';
      case 'ghost':
        return pressed ? colors.cardHover : 'transparent';
      case 'danger':
        return pressed ? '#B91C1C' : colors.danger;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return colors.primary;
      case 'outline':
      case 'ghost':
        return colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    if (variant === 'outline') return colors.cardBorder;
    if (variant === 'secondary') return colors.cardBorder;
    return 'transparent';
  };

  // Height and padding settings for accessible touch target (min 48dp)
  const minHeight = size === 'sm' ? 38 : MinTouchTarget;
  const paddingHorizontal = size === 'sm' ? Spacing.md : size === 'lg' ? Spacing.xl : Spacing.lg;
  const fontSize = (size === 'sm' ? 13 : size === 'lg' ? 16 : 14.5) * fontSizeMultiplier;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          minHeight,
          paddingHorizontal,
          borderRadius: BorderRadius.md,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled && !loading ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' ? (
            <View style={styles.iconLeft}>{icon}</View>
          ) : null}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' ? (
            <View style={styles.iconRight}>{icon}</View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
