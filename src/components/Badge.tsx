import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type BadgeTone = 'primary' | 'neutral' | 'positive' | 'warning';

/** Small pill label used for position type, LPAC, co-invest flags, etc. */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const { theme } = useTheme();

  const palette: Record<BadgeTone, { bg: string; fg: string }> = {
    primary: { bg: theme.colors.primaryMuted, fg: theme.colors.primary },
    neutral: { bg: theme.colors.surfaceAlt, fg: theme.colors.textSecondary },
    positive: {
      bg: theme.mode === 'dark' ? '#14532d' : '#dcfce7',
      fg: theme.colors.positive,
    },
    warning: {
      bg: theme.mode === 'dark' ? '#422006' : '#fef3c7',
      fg: theme.colors.warning,
    },
  };

  const { bg, fg } = palette[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: theme.radius.sm }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
