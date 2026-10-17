import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, MinTouchTarget } from '@/constants/theme';
import { Search, X } from 'lucide-react-native';
import { appHaptics } from '@/utils/haptics';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search stories...',
  style,
}) => {
  const { colors, fontSizeMultiplier } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    appHaptics.light();
    onChangeText('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBg,
          borderColor: isFocused ? colors.inputFocusBorder : colors.inputBorder,
        },
        style,
      ]}
    >
      <Search
        size={18}
        color={isFocused ? colors.primary : colors.textMuted}
        style={styles.searchIcon}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        accessibilityRole="search"
        accessibilityLabel="Search stories input"
        style={[
          styles.input,
          {
            color: colors.text,
            fontSize: 14 * fontSizeMultiplier,
          },
        ]}
      />

      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          style={styles.clearBtn}
        >
          <X size={16} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: MinTouchTarget,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontWeight: '500',
  },
  clearBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
