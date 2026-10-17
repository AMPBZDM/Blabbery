import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { StoryTemplate, WordFieldType } from '@/types/story';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { AppBadge } from '@/components/common/Badge';
import { AppButton } from '@/components/common/Button';
import { appHaptics } from '@/utils/haptics';
import {
  X,
  Heart,
  Play,
  RotateCcw,
  Clock,
  Sparkles,
  BarChart,
  Pizza,
  Rocket,
  Compass,
  Briefcase,
  Cat,
  Ghost,
  BookOpen,
  Car,
  CheckCircle2,
} from 'lucide-react-native';

interface StoryDetailModalProps {
  template: StoryTemplate | null;
  visible: boolean;
  isFavorite: boolean;
  hasDraft?: boolean;
  onClose: () => void;
  onStartStory: (templateId: string) => void;
  onToggleFavorite: (templateId: string) => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  template,
  visible,
  isFavorite,
  hasDraft = false,
  onClose,
  onStartStory,
  onToggleFavorite,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();

  // Summarize and label word types
  const wordTypeSummary = useMemo(() => {
    if (!template) return [];

    const getWordTypeLabel = (type: WordFieldType): string => {
      switch (type) {
        case 'noun':
          return 'Noun';
        case 'adjective':
          return 'Adjective';
        case 'verb':
          return 'Verb';
        case 'person_name':
          return "Person's Name";
        case 'location':
          return 'Place / Location';
        case 'food':
          return 'Food';
        case 'animal':
          return 'Animal';
        case 'number':
          return 'Number';
        case 'exclamation':
          return 'Exclamation';
        case 'general':
        default:
          return 'General Word';
      }
    };

    const counts: Record<string, { label: string; count: number }> = {};
    for (const prompt of template.prompts) {
      const type = prompt.type || 'general';
      if (!counts[type]) {
        counts[type] = { label: getWordTypeLabel(type), count: 0 };
      }
      counts[type].count += 1;
    }

    return Object.values(counts);
  }, [template]);

  if (!template) return null;

  const renderIcon = () => {
    const size = 26;
    const color = colors.primary;
    switch (template.iconName) {
      case 'Pizza':
        return <Pizza size={size} color={color} />;
      case 'Rocket':
        return <Rocket size={size} color={color} />;
      case 'Compass':
        return <Compass size={size} color={color} />;
      case 'Briefcase':
        return <Briefcase size={size} color={color} />;
      case 'Cat':
        return <Cat size={size} color={color} />;
      case 'Ghost':
        return <Ghost size={size} color={color} />;
      case 'Car':
        return <Car size={size} color={color} />;
      default:
        return <BookOpen size={size} color={color} />;
    }
  };

  const getCategoryLabel = () => {
    switch (template.category) {
      case 'funny':
        return 'Funny';
      case 'scifi':
        return 'Sci-Fi';
      case 'adventure':
        return 'Adventure';
      case 'school_work':
        return 'School & Work';
      case 'animals':
        return 'Animals';
      case 'spooky':
        return 'Spooky';
      default:
        return 'Story';
    }
  };

  const getDifficultyLabel = () => {
    switch (template.difficulty) {
      case 'easy':
        return 'Easy';
      case 'medium':
        return 'Medium';
      case 'hard':
        return 'Challenging';
      default:
        return 'Normal';
    }
  };

  const handleStart = () => {
    appHaptics.medium();
    onClose();
    onStartStory(template.id);
  };

  const handleFavorite = () => {
    appHaptics.selection();
    onToggleFavorite(template.id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop tap closes modal */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Close story details"
        />

        {/* Modal content sheet */}
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Top handle bar */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handleBar,
                { backgroundColor: colors.cardBorder },
              ]}
            />
          </View>

          {/* Header row with icon, category badge, and close button */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                {renderIcon()}
              </View>
              <View>
                <AppBadge label={getCategoryLabel()} variant="primary" size="sm" />
                {hasDraft && (
                  <View style={{ marginTop: 4 }}>
                    <AppBadge label="Draft available" variant="warning" size="sm" />
                  </View>
                )}
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: colors.cardHover,
                  borderColor: colors.cardBorder,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Story Title */}
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: Typography.titleLarge.fontSize * fontSizeMultiplier,
                },
              ]}
            >
              {template.title}
            </Text>

            {/* Key Metadata Row */}
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.metaBadge,
                  { backgroundColor: colors.cardHover, borderColor: colors.cardBorder },
                ]}
              >
                <Clock size={14} color={colors.primary} />
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.text, fontSize: 12.5 * fontSizeMultiplier },
                  ]}
                >
                  ~{template.estimatedMinutes} min
                </Text>
              </View>

              <View
                style={[
                  styles.metaBadge,
                  { backgroundColor: colors.cardHover, borderColor: colors.cardBorder },
                ]}
              >
                <Sparkles size={14} color={colors.primary} />
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.text, fontSize: 12.5 * fontSizeMultiplier },
                  ]}
                >
                  {template.prompts.length} words
                </Text>
              </View>

              <View
                style={[
                  styles.metaBadge,
                  { backgroundColor: colors.cardHover, borderColor: colors.cardBorder },
                ]}
              >
                <BarChart size={14} color={colors.primary} />
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.text, fontSize: 12.5 * fontSizeMultiplier },
                  ]}
                >
                  {getDifficultyLabel()}
                </Text>
              </View>
            </View>

            {/* Short Description */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontSize: Typography.bodySemibold.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                About the Story
              </Text>
              <Text
                style={[
                  styles.description,
                  {
                    color: colors.textSecondary,
                    fontSize: 14.5 * fontSizeMultiplier,
                  },
                ]}
              >
                {template.description}
              </Text>
            </View>

            {/* Word Types Breakdown */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontSize: Typography.bodySemibold.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                Required Words Breakdown ({template.prompts.length} words)
              </Text>
              <View style={styles.wordTypesGrid}>
                {wordTypeSummary.map((item) => (
                  <View
                    key={item.label}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: colors.cardHover,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeLabel,
                        {
                          color: colors.text,
                          fontSize: 12.5 * fontSizeMultiplier,
                        },
                      ]}
                    >
                      {item.label}:{' '}
                      <Text style={{ fontWeight: '800', color: colors.primary }}>
                        {item.count}
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Prompts Preview */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontSize: Typography.bodySemibold.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                First Prompts
              </Text>
              <View style={styles.promptsPreviewList}>
                {template.prompts.slice(0, 3).map((prompt, idx) => (
                  <View key={prompt.id} style={styles.promptItem}>
                    <CheckCircle2 size={15} color={colors.primary} />
                    <Text
                      style={[
                        styles.promptItemText,
                        {
                          color: colors.textSecondary,
                          fontSize: 13 * fontSizeMultiplier,
                        },
                      ]}
                    >
                      {idx + 1}. {prompt.label}
                    </Text>
                  </View>
                ))}
                {template.prompts.length > 3 && (
                  <Text
                    style={[
                      styles.morePromptsText,
                      { color: colors.textMuted, fontSize: 12 * fontSizeMultiplier },
                    ]}
                  >
                    + {template.prompts.length - 3} more words to fill in
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Bar: Favorite button & Start Story CTA */}
          <View
            style={[
              styles.footerActions,
              {
                borderTopColor: colors.cardBorder,
                backgroundColor: colors.card,
              },
            ]}
          >
            <Pressable
              onPress={handleFavorite}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
              hitSlop={8}
              style={({ pressed }) => [
                styles.favButton,
                {
                  backgroundColor: isFavorite ? colors.dangerLight : colors.cardHover,
                  borderColor: isFavorite ? colors.danger : colors.cardBorder,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
              ]}
            >
              <Heart
                size={22}
                color={isFavorite ? colors.danger : colors.textSecondary}
                fill={isFavorite ? colors.danger : 'transparent'}
              />
            </Pressable>

            <View style={styles.startBtnWrap}>
              <AppButton
                title={hasDraft ? 'Resume Story' : 'Start Game'}
                onPress={handleStart}
                variant="primary"
                size="md"
                icon={
                  hasDraft ? (
                    <RotateCcw size={18} color="#FFFFFF" />
                  ) : (
                    <Play size={18} color="#FFFFFF" />
                  )
                }
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
    paddingBottom: Spacing.xl,
    ...Shadows.modal,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  metaText: {
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  description: {
    lineHeight: 22,
  },
  wordTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4,
  },
  typeChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  typeLabel: {
    fontWeight: '500',
  },
  promptsPreviewList: {
    gap: Spacing.xs + 2,
    marginTop: 4,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  promptItemText: {
    flex: 1,
  },
  morePromptsText: {
    fontStyle: 'italic',
    marginTop: 2,
    marginLeft: 23,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  favButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnWrap: {
    flex: 1,
  },
});
