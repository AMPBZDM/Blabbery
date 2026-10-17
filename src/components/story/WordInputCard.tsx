import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { WordPrompt } from '@/types/story';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { getRandomWordSuggestion } from '@/data/wordBanks';
import {
  formatWordTypeLabel,
  MAX_WORD_LENGTH,
} from '@/services/engine/wordInputValidator';
import { AppBadge } from '@/components/common/Badge';
import { appHaptics } from '@/utils/haptics';
import { Dices, X, AlertCircle, Sparkles } from 'lucide-react-native';

interface WordInputCardProps {
  prompt: WordPrompt;
  value: string;
  errorMessage?: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLast: boolean;
  showSuggestions?: boolean;
}

export const WordInputCard: React.FC<WordInputCardProps> = ({
  prompt,
  value,
  errorMessage,
  onChangeText,
  onSubmit,
  isLast,
  showSuggestions = false,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const isRequired = prompt.isRequired !== false;
  const isOverLimit = value.length > MAX_WORD_LENGTH;

  // Auto-focus input on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [prompt.id]);

  const handleRandomize = () => {
    appHaptics.medium();
    const suggestion = getRandomWordSuggestion(
      prompt.type || prompt.category || 'noun',
      prompt.examples
    );
    onChangeText(suggestion);
  };

  const handleSelectExample = (example: string) => {
    appHaptics.selection();
    onChangeText(example);
  };

  const handleClear = () => {
    appHaptics.light();
    onChangeText('');
    inputRef.current?.focus();
  };

  const getAutoCapitalize = () => {
    if (prompt.type === 'person_name' || prompt.type === 'location') {
      return 'words';
    }
    return 'sentences';
  };

  const getKeyboardType = () => {
    if (prompt.type === 'number') {
      return 'numeric';
    }
    return 'default';
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: errorMessage ? colors.danger : colors.cardBorder,
        },
      ]}
    >
      {/* Header: word type badge, required status, and random idea button */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <AppBadge
            label={formatWordTypeLabel(prompt.type)}
            variant="primary"
            size="sm"
          />
          {isRequired ? (
            <AppBadge label="Required" variant="neutral" size="sm" />
          ) : (
            <AppBadge label="Optional" variant="neutral" size="sm" />
          )}
        </View>

        {showSuggestions && (
          <Pressable
            onPress={handleRandomize}
            accessibilityRole="button"
            accessibilityLabel="Random idea button, insert random word"
            hitSlop={8}
            style={({ pressed }) => [
              styles.randomButton,
              {
                backgroundColor: colors.primaryLight,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Dices size={16} color={colors.primary} />
            <Text
              style={[
                styles.randomButtonText,
                { color: colors.primary, fontSize: 12.5 * fontSizeMultiplier },
              ]}
            >
              Random Idea
            </Text>
          </Pressable>
        )}
      </View>

      {/* Prompt label */}
      <Text
        style={[
          styles.promptLabel,
          {
            color: colors.text,
            fontSize: Typography.titleLarge.fontSize * fontSizeMultiplier,
          },
        ]}
      >
        {prompt.label}
      </Text>

      {/* Helpful hint or sample text (if enabled in settings) */}
      {showSuggestions && prompt.hint ? (
        <Text
          style={[
            styles.promptHint,
            {
              color: colors.textMuted,
              fontSize: Typography.caption.fontSize * fontSizeMultiplier,
            },
          ]}
        >
          💡 {prompt.hint}
        </Text>
      ) : null}

      {/* Quick suggestion chips from word bank (if enabled in settings) */}
      {showSuggestions && prompt.examples && prompt.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          <View style={styles.examplesLabelRow}>
            <Sparkles size={12} color={colors.textMuted} />
            <Text
              style={[
                styles.examplesLabel,
                { color: colors.textMuted, fontSize: 11.5 * fontSizeMultiplier },
              ]}
            >
              Quick ideas:
            </Text>
          </View>
          <View style={styles.exampleChipsRow}>
            {prompt.examples.slice(0, 3).map((item) => (
              <Pressable
                key={item}
                onPress={() => handleSelectExample(item)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Insert suggestion: ${item}`}
                style={({ pressed }) => [
                  styles.exampleChip,
                  {
                    backgroundColor: colors.cardHover,
                    borderColor: colors.cardBorder,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.exampleChipText,
                    { color: colors.text, fontSize: 12 * fontSizeMultiplier },
                  ]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Input field container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg,
            borderColor: errorMessage
              ? colors.danger
              : value.trim()
              ? colors.inputFocusBorder
              : colors.inputBorder,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder="Type a word here..."
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: Typography.bodyLarge.fontSize * fontSizeMultiplier,
            },
          ]}
          maxLength={MAX_WORD_LENGTH}
          returnKeyType={isLast ? 'done' : 'next'}
          onSubmitEditing={onSubmit}
          blurOnSubmit={false}
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize={getAutoCapitalize()}
          keyboardType={getKeyboardType()}
          accessibilityLabel={prompt.label}
        />

        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear field"
            hitSlop={10}
            style={styles.clearButton}
          >
            <X size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Footer info row: error message and character counter */}
      <View style={styles.inputFooterRow}>
        {errorMessage ? (
          <View style={styles.errorRow}>
            <AlertCircle size={14} color={colors.danger} />
            <Text
              style={[
                styles.errorText,
                { color: colors.danger, fontSize: 12 * fontSizeMultiplier },
              ]}
            >
              {errorMessage}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <Text
          style={[
            styles.charCount,
            {
              color: isOverLimit ? colors.danger : colors.textMuted,
              fontSize: 11.5 * fontSizeMultiplier,
            },
          ]}
        >
          {value.length}/{MAX_WORD_LENGTH}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  randomButtonText: {
    fontWeight: '700',
  },
  promptLabel: {
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  promptInstruction: {
    marginBottom: 6,
    lineHeight: 20,
  },
  promptHint: {
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  examplesContainer: {
    marginBottom: Spacing.md,
  },
  examplesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  examplesLabel: {
    fontWeight: '600',
  },
  exampleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  exampleChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  exampleChipText: {
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontWeight: '600',
  },
  clearButton: {
    padding: Spacing.xs,
  },
  inputFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    minHeight: 20,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  errorText: {
    fontWeight: '600',
  },
  charCount: {
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
});
