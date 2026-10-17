import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

interface ProgressBarProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
  isReview?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  isReview = false,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const progressPercent = isReview
    ? 100
    : Math.min(100, Math.max(0, ((currentStep + 1) / totalSteps) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.stepText,
            { color: colors.textSecondary, fontSize: 13 * fontSizeMultiplier },
          ]}
        >
          {isReview
            ? 'Review and Confirm'
            : `Word ${currentStep + 1} of ${totalSteps}`}
        </Text>
        <Text
          style={[
            styles.percentText,
            {
              color: isReview ? colors.success : colors.primary,
              fontSize: 13 * fontSizeMultiplier,
            },
          ]}
        >
          {Math.round(progressPercent)}%
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progressPercent}%`,
              backgroundColor: isReview ? colors.success : colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepText: {
    fontWeight: '600',
  },
  percentText: {
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
