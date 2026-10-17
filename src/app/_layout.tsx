import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@/hooks/use-theme';

// Keep splash screen visible until initialization completes
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Hide splash screen once component mounts
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="story/[id]"
          options={{
            headerShown: false,
            gestureEnabled: false, // Prevent accidental back gesture while filling words
          }}
        />
        <Stack.Screen
          name="result/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
