import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card } from '@/components/Card';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { StatCard } from '@/components/StatCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePortfolio } from '@/context/PortfolioContext';
import { useTheme } from '@/context/ThemeContext';
import { navByType } from '@/utils/calculations';
import { formatCompactUsd, formatMultiple, formatPercent } from '@/utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function PortfolioScreen() {
  const { theme } = useTheme();
  const { positions, totals, refresh } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Build pie chart data from NAV-by-type allocation.
  const pieData = useMemo(() => {
    const grouped = navByType(positions);
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([type, value], i) => ({
        name: type,
        population: Math.round(value),
        color: theme.colors.chart[i % theme.colors.chart.length],
        legendFontColor: theme.colors.chartLabel,
        legendFontSize: 12,
      }));
  }, [positions, theme]);

  const calledPct = totals.totalCommitment > 0 ? totals.totalCalled / totals.totalCommitment : 0;

  return (
    <ScreenContainer title="Portfolio" subtitle="Talipot Capital · LP Dashboard" accessory={<ThemeToggle />}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Hero: total value */}
        <Card style={{ backgroundColor: theme.colors.primary }}>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.heroValue}>{formatCompactUsd(totals.totalValue)}</Text>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroSubLabel}>Net IRR (wtd)</Text>
              <Text style={styles.heroSubValue}>{formatPercent(totals.weightedNetIrr)}</Text>
            </View>
            <View>
              <Text style={styles.heroSubLabel}>Net TVPI</Text>
              <Text style={styles.heroSubValue}>{formatMultiple(totals.tvpi)}</Text>
            </View>
            <View>
              <Text style={styles.heroSubLabel}>DPI</Text>
              <Text style={styles.heroSubValue}>{formatMultiple(totals.dpi)}</Text>
            </View>
          </View>
        </Card>

        {/* Key totals grid */}
        <View style={styles.gridSpacer} />
        <View style={styles.grid}>
          <StatCard label="Committed" value={formatCompactUsd(totals.totalCommitment)} tone="primary" />
          <StatCard label="Total NAV" value={formatCompactUsd(totals.totalNav)} />
          <StatCard
            label="Called"
            value={formatCompactUsd(totals.totalCalled)}
            hint={`${formatPercent(calledPct, 0)} of commit`}
          />
          <StatCard label="Unfunded" value={formatCompactUsd(totals.totalUnfunded)} hint="Dry powder" />
          <StatCard label="Distributed" value={formatCompactUsd(totals.totalDistributed)} tone="positive" />
          <StatCard label="Net MOIC" value={formatMultiple(totals.netMoic)} />
        </View>

        {/* Capital deployment progress */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            Capital Deployed · {formatPercent(calledPct, 0)}
          </Text>
          <View style={[styles.track, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View
              style={[
                styles.fill,
                { width: `${Math.min(calledPct * 100, 100)}%`, backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressHint, { color: theme.colors.textMuted }]}>
              {formatCompactUsd(totals.totalCalled)} called
            </Text>
            <Text style={[styles.progressHint, { color: theme.colors.textMuted }]}>
              {formatCompactUsd(totals.totalCommitment)} committed
            </Text>
          </View>
        </Card>

        {/* Allocation pie */}
        <SectionHeader title="Allocation by NAV" subtitle={`${totals.positionCount} positions`} />
        <Card>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={SCREEN_WIDTH - 72}
              height={210}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
              chartConfig={{
                color: () => theme.colors.text,
                labelColor: () => theme.colors.chartLabel,
              }}
            />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="pie-chart-outline" size={40} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Add positions to see allocation
              </Text>
            </View>
          )}
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  heroValue: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 6, letterSpacing: -1 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  heroSubLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  heroSubValue: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 3 },
  gridSpacer: { height: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressHint: { fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { marginTop: 8, fontSize: 14 },
});
