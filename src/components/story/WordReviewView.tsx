import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { WordPrompt } from '@/types/story';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { AppBadge } from '@/components/common/Badge';
import { formatWordTypeLabel } from '@/services/engine/wordInputValidator';
import { appHaptics } from '@/utils/haptics';
import {
  Pencil,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';

interface WordReviewViewProps {
  prompts: WordPrompt[];
  enteredWords: Record<string, string>;
  onEditStep: (stepIndex: number) => void;
}

export const WordReviewView: React.FC<WordReviewViewProps> = ({
  prompts,
  enteredWords,
  onEditStep,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header card */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.primaryLight,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Sparkles size={20} color={colors.primary} />
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.primary,
                fontSize: Typography.titleMedium.fontSize * fontSizeMultiplier,
              },
            ]}
          >
            Review Your Words
          </Text>
        </View>
        <Text
          style={[
            styles.headerDesc,
            {
              color: colors.textSecondary,
              fontSize: Typography.caption.fontSize * fontSizeMultiplier,
            },
          ]}
        >
          {"All words are ready! Check your answers before revealing the story. If you'd like to change anything, tap the pencil icon!"}
        </Text>
      </View>

      {/* Word list */}
      <View style={styles.list}>
        {prompts.map((prompt, index) => {
          const rawVal = enteredWords[prompt.id] || '';
          const trimmedVal = rawVal.trim();
          const isFilled = trimmedVal.length > 0;

          return (
            <Pressable
              key={prompt.id}
              onPress={() => {
                appHaptics.selection();
                onEditStep(index);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Word #${index + 1}, ${prompt.label}: ${trimmedVal || 'Not filled'}. Tap to edit.`}
              style={({ pressed }) => [
                styles.itemCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isFilled ? colors.cardBorder : colors.danger,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
            >
              <View style={styles.itemTopRow}>
                <View style={styles.itemMeta}>
                  <Text
                    style={[
                      styles.itemIndex,
                      {
                        color: colors.textMuted,
                        fontSize: 12 * fontSizeMultiplier,
                      },
                    ]}
                  >
                    #{index + 1}
                  </Text>
                  <AppBadge
                    label={formatWordTypeLabel(prompt.type)}
                    variant="neutral"
                    size="sm"
                  />
                </View>

                <View style={styles.editBtn}>
                  <Pencil size={14} color={colors.primary} />
                  <Text
                    style={[
                      styles.editText,
                      { color: colors.primary, fontSize: 12 * fontSizeMultiplier },
                    ]}
                  >
                    Edit
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.itemLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: 13 * fontSizeMultiplier,
                  },
                ]}
              >
                {prompt.label}
              </Text>

              <View
                style={[
                  styles.wordBox,
                  {
                    backgroundColor: isFilled
                      ? colors.wordBadgeBg
                      : colors.dangerLight,
                    borderColor: isFilled
                      ? colors.wordBadgeBorder
                      : colors.danger,
                  },
                ]}
              >
                {isFilled ? (
                  <>
                    <CheckCircle2 size={16} color={colors.primary} />
                    <Text
                      style={[
                        styles.wordText,
                        {
                          color: colors.wordBadgeText,
                          fontSize: 16 * fontSizeMultiplier,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {trimmedVal}
                    </Text>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} color={colors.danger} />
                    <Text
                      style={[
                        styles.missingText,
                        {
                          color: colors.danger,
                          fontSize: 14 * fontSizeMultiplier,
                        },
                      ]}
                    >
                      Missing (Tap to enter)
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  headerTitle: {
    fontWeight: '800',
  },
  headerDesc: {
    lineHeight: 18,
  },
  list: {
    gap: Spacing.sm,
  },
  itemCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  itemIndex: {
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editText: {
    fontWeight: '700',
  },
  itemLabel: {
    fontWeight: '500',
    marginBottom: 6,
  },
  wordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  wordText: {
    fontWeight: '800',
    flex: 1,
  },
  missingText: {
    fontWeight: '600',
    fontStyle: 'italic',
    flex: 1,
  },
});
