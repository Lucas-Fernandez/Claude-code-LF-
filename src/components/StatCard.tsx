import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface StatCardProps {
  label: string;
  value: string;
  /** Optional secondary line (e.g. a sub-metric or delta). */
  hint?: string;
  /** Tints the value text. 'neutral' uses primary text color. */
  tone?: 'neutral' | 'positive' | 'negative' | 'primary';
  /** Render as a compact half-width tile inside a flex-wrap grid. */
  half?: boolean;
}

/** Single KPI tile used in the dashboard totals grid. */
export function StatCard({ label, value, hint, tone = 'neutral', half = true }: StatCardProps) {
  const { theme } = useTheme();

  const valueColor =
    tone === 'positive'
      ? theme.colors.positive
      : tone === 'negative'
      ? theme.colors.negative
      : tone === 'primary'
      ? theme.colors.primary
      : theme.colors.text;

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing(3.5),
          width: half ? '48%' : '100%',
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.colors.textSecondary }]} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
