import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Sparkles } from 'lucide-react-native';

interface ShareCardViewProps {
  title: string;
  assembledText: string;
}

export const ShareCardView = forwardRef<View, ShareCardViewProps>(
  ({ title, assembledText }, ref) => {
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.decorHeader}>
          <Sparkles size={22} color="#FBBF24" />
          <Text style={styles.appName}>BLABBERY</Text>
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.divider} />

        <Text style={styles.body}>{assembledText}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Blabbery – 100% Offline Fun! 🚀</Text>
        </View>
      </View>
    );
  }
);

ShareCardView.displayName = 'ShareCardView';

const styles = StyleSheet.create({
  card: {
    width: 360,
    backgroundColor: '#1E1B4B', // Deep midnight blue / indigo background
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  decorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  appName: {
    color: '#A5B4FC',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 2,
    backgroundColor: '#3730A3',
    width: 60,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    color: '#E0E7FF',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#312E81',
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  footerText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
});
