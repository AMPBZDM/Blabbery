import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { BookOpen, BookmarkCheck, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { colors, fontSizeMultiplier } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          height: Platform.OS === 'ios' ? 82 : 62,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 11 * fontSizeMultiplier,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <BookmarkCheck size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
