import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Card } from '@/components/Card';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { usePortfolio } from '@/context/PortfolioContext';
import { useTheme } from '@/context/ThemeContext';
import { portfolioToText } from '@/utils/export';
import { formatCompactUsd, formatMultiple, formatPercent } from '@/utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Which value the bar chart plots. */
type BarMetric = 'nav' | 'commitment';

export function MetricsScreen() {
  const { theme } = useTheme();
  const { positions, totals } = usePortfolio();
  const [barMetric, setBarMetric] = useState<BarMetric>('nav');

  // Top 6 positions by the selected metric keep the chart legible on a phone.
  const barData = useMemo(() => {
    const sorted = [...positions]
      .sort((a, b) =>
        barMetric === 'nav' ? b.currentNav - a.currentNav : b.commitment - a.commitment
      )
      .slice(0, 6);

    return {
      labels: sorted.map((p) => (p.name.length > 8 ? `${p.name.slice(0, 7)}…` : p.name)),
      datasets: [
        {
          data: sorted.map((p) =>
            barMetric === 'nav'
              ? Math.round(p.currentNav / 1_000_000)
              : Math.round(p.commitment / 1_000_000)
          ),
        },
      ],
    };
  }, [positions, barMetric]);

  // Best / worst performers by net IRR.
  const ranked = useMemo(() => [...positions].sort((a, b) => b.irrNet - a.irrNet), [positions]);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  const exportText = async () => {
    if (positions.length === 0) {
      Alert.alert('Nothing to export', 'Add some positions first.');
      return;
    }
    await Clipboard.setStringAsync(portfolioToText(positions, totals));
    Alert.alert('Copied', 'Portfolio summary copied to clipboard.');
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      theme.mode === 'dark' ? `rgba(96,165,250,${opacity})` : `rgba(37,99,235,${opacity})`,
    labelColor: () => theme.colors.chartLabel,
    barPercentage: 0.6,
    propsForBackgroundLines: { stroke: theme.colors.divider },
  };

  const MetricToggle = ({ label, value }: { label: string; value: BarMetric }) => {
    const active = barMetric === value;
    return (
      <Pressable
        onPress={() => setBarMetric(value)}
        style={[
          styles.toggle,
          {
            backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
            borderColor: active ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <Text
          style={{
            color: active ? theme.colors.primaryText : theme.colors.textSecondary,
            fontWeight: '600',
            fontSize: 13,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const Row = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
    <View style={[styles.dataRow, { borderBottomColor: theme.colors.divider }]}>
      <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.dataValue, { color: tone ?? theme.colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <ScreenContainer
      title="Metrics"
      subtitle="Performance deep dive"
      accessory={
        <Pressable
          onPress={exportText}
          hitSlop={10}
          style={[styles.exportBtn, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Performance multiples */}
        <SectionHeader title="Portfolio Multiples" />
        <Card>
          <Row label="Net IRR (NAV-weighted)" value={formatPercent(totals.weightedNetIrr)} tone={theme.colors.positive} />
          <Row label="Gross IRR (NAV-weighted)" value={formatPercent(totals.weightedGrossIrr)} />
          <Row label="Net TVPI" value={formatMultiple(totals.tvpi)} />
          <Row label="DPI (realized)" value={formatMultiple(totals.dpi)} />
          <Row label="RVPI (unrealized)" value={formatMultiple(totals.rvpi)} />
          <Row label="Net MOIC" value={formatMultiple(totals.netMoic)} />
        </Card>

        {/* Bar chart */}
        <SectionHeader
          title={barMetric === 'nav' ? 'NAV by Position' : 'Commitment by Position'}
          subtitle="In $M · top 6"
          accessory={
            <View style={styles.toggleGroup}>
              <MetricToggle label="NAV" value="nav" />
              <MetricToggle label="Commit" value="commitment" />
            </View>
          }
        />
        <Card>
          {positions.length > 0 ? (
            <BarChart
              data={barData}
              width={SCREEN_WIDTH - 72}
              height={240}
              yAxisLabel="$"
              yAxisSuffix="M"
              fromZero
              showValuesOnTopOfBars
              chartConfig={chartConfig}
              style={styles.chart}
              verticalLabelRotation={0}
            />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="bar-chart-outline" size={40} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No data yet</Text>
            </View>
          )}
        </Card>

        {/* Capital summary */}
        <SectionHeader title="Capital Summary" />
        <Card>
          <Row label="Total Committed" value={formatCompactUsd(totals.totalCommitment)} />
          <Row label="Total Called" value={formatCompactUsd(totals.totalCalled)} />
          <Row label="Unfunded (dry powder)" value={formatCompactUsd(totals.totalUnfunded)} />
          <Row label="Total Distributed" value={formatCompactUsd(totals.totalDistributed)} tone={theme.colors.positive} />
          <Row label="Total NAV" value={formatCompactUsd(totals.totalNav)} />
          <Row label="Total Value (NAV + Dist)" value={formatCompactUsd(totals.totalValue)} tone={theme.colors.primary} />
        </Card>

        {/* Best / worst */}
        {best && worst && positions.length > 1 ? (
          <>
            <SectionHeader title="Performance Leaders" />
            <Card>
              <View style={styles.leaderRow}>
                <Ionicons name="trending-up" size={20} color={theme.colors.positive} />
                <View style={styles.leaderText}>
                  <Text style={[styles.leaderName, { color: theme.colors.text }]}>{best.name}</Text>
                  <Text style={[styles.leaderHint, { color: theme.colors.textMuted }]}>
                    Top net IRR
                  </Text>
                </View>
                <Text style={[styles.leaderValue, { color: theme.colors.positive }]}>
                  {formatPercent(best.irrNet)}
                </Text>
              </View>
              <View style={[styles.leaderRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.divider }]}>
                <Ionicons name="trending-down" size={20} color={theme.colors.negative} />
                <View style={styles.leaderText}>
                  <Text style={[styles.leaderName, { color: theme.colors.text }]}>{worst.name}</Text>
                  <Text style={[styles.leaderHint, { color: theme.colors.textMuted }]}>
                    Lowest net IRR
                  </Text>
                </View>
                <Text style={[styles.leaderValue, { color: theme.colors.negative }]}>
                  {formatPercent(worst.irrNet)}
                </Text>
              </View>
            </Card>
          </>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dataLabel: { fontSize: 14 },
  dataValue: { fontSize: 16, fontWeight: '700' },
  toggleGroup: { flexDirection: 'row', gap: 6 },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chart: { borderRadius: 12, marginLeft: -8 },
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { marginTop: 8, fontSize: 14 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  leaderText: { flex: 1 },
  leaderName: { fontSize: 15, fontWeight: '700' },
  leaderHint: { fontSize: 12, marginTop: 2 },
  leaderValue: { fontSize: 18, fontWeight: '800' },
});
