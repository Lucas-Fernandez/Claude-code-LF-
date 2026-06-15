import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Position } from '@/types';
import { formatCompactUsd, formatMultiple, formatPercent } from '@/utils/format';
import { Badge } from './Badge';

interface PositionCardProps {
  position: Position;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** A single metric column inside the card footer. */
function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

export function PositionCard({ position, onPress, onEdit, onDelete }: PositionCardProps) {
  const { theme } = useTheme();
  const irrColor = position.irrNet >= 0 ? theme.colors.positive : theme.colors.negative;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {/* Header: name + manager on the left, quick actions on the right */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {position.name}
          </Text>
          <Text style={[styles.manager, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {position.manager} · {position.vintageYear}
          </Text>
        </View>

        <View style={styles.actions}>
          {onEdit ? (
            <Pressable onPress={onEdit} hitSlop={10} style={styles.iconButton}>
              <Ionicons name="create-outline" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable onPress={onDelete} hitSlop={10} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.negative} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Tags */}
      <View style={styles.badges}>
        <Badge label={position.type} tone="primary" />
        {position.lpacSeat ? <Badge label="LPAC" tone="positive" /> : null}
        {position.coInvestOpportunity ? <Badge label="Co-Invest" tone="warning" /> : null}
      </View>

      {/* Metrics footer */}
      <View style={[styles.metricsRow, { borderTopColor: theme.colors.divider }]}>
        <Metric label="Commit" value={formatCompactUsd(position.commitment)} color={theme.colors.text} />
        <Metric label="NAV" value={formatCompactUsd(position.currentNav)} color={theme.colors.text} />
        <Metric label="Net IRR" value={formatPercent(position.irrNet)} color={irrColor} />
        <Metric label="TVPI" value={formatMultiple(position.netTvpi)} color={theme.colors.text} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, paddingRight: 8 },
  name: { fontSize: 17, fontWeight: '700' },
  manager: { fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row' },
  iconButton: { paddingHorizontal: 6, paddingVertical: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metric: { flex: 1 },
  metricLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4, marginBottom: 3 },
  metricValue: { fontSize: 15, fontWeight: '700' },
});
