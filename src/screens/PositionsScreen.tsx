import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PositionCard } from '@/components/PositionCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { usePortfolio } from '@/context/PortfolioContext';
import { useTheme } from '@/context/ThemeContext';
import { RootStackParamList } from '@/navigation/types';
import { Position, POSITION_TYPES } from '@/types';
import { uniqueVintages } from '@/utils/calculations';
import { positionsToCsv } from '@/utils/export';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Either a type or a vintage year can be the active filter. */
type Filter = { kind: 'all' } | { kind: 'type'; value: string } | { kind: 'vintage'; value: number };

export function PositionsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { positions, deletePosition, refresh } = usePortfolio();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>({ kind: 'all' });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const vintages = useMemo(() => uniqueVintages(positions), [positions]);

  // Build the available filter chips (only types that actually exist).
  const usedTypes = useMemo(
    () => POSITION_TYPES.filter((t) => positions.some((p) => p.type === t)),
    [positions]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return positions.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.manager.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q);

      const matchesFilter =
        filter.kind === 'all' ||
        (filter.kind === 'type' && p.type === filter.value) ||
        (filter.kind === 'vintage' && p.vintageYear === filter.value);

      return matchesQuery && matchesFilter;
    });
  }, [positions, query, filter]);

  const confirmDelete = (position: Position) => {
    Alert.alert('Delete position', `Remove "${position.name}" from your portfolio?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePosition(position.id) },
    ]);
  };

  const exportCsv = async () => {
    if (positions.length === 0) {
      Alert.alert('Nothing to export', 'Add some positions first.');
      return;
    }
    await Clipboard.setStringAsync(positionsToCsv(positions));
    Alert.alert('Copied', 'Portfolio CSV copied to clipboard.');
  };

  const isActive = (f: Filter) =>
    f.kind === filter.kind &&
    (f.kind === 'all' ||
      (f.kind === 'type' && filter.kind === 'type' && f.value === filter.value) ||
      (f.kind === 'vintage' && filter.kind === 'vintage' && f.value === filter.value));

  const Chip = ({ label, f }: { label: string; f: Filter }) => {
    const active = isActive(f);
    return (
      <Pressable
        onPress={() => setFilter(f)}
        style={[
          styles.chip,
          {
            backgroundColor: active ? theme.colors.primary : theme.colors.surface,
            borderColor: active ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <Text
          style={{
            color: active ? theme.colors.primaryText : theme.colors.textSecondary,
            fontSize: 13,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenContainer
      title="Positions"
      subtitle={`${filtered.length} of ${positions.length}`}
      accessory={
        <Pressable
          onPress={exportCsv}
          hitSlop={10}
          style={[styles.exportBtn, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
        </Pressable>
      }
    >
      {/* Search */}
      <View style={styles.searchWrap}>
        <View
          style={[
            styles.search,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search name, manager, type…"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.text }]}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { key: 'all', node: <Chip label="All" f={{ kind: 'all' }} /> },
          ...usedTypes.map((t) => ({
            key: `type-${t}`,
            node: <Chip label={t} f={{ kind: 'type', value: t }} />,
          })),
          ...vintages.map((v) => ({
            key: `vintage-${v}`,
            node: <Chip label={`'${String(v).slice(2)}`} f={{ kind: 'vintage', value: v }} />,
          })),
        ]}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => item.node}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsList}
      />

      {/* Positions list */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <PositionCard
            position={item}
            onPress={() => navigation.navigate('EditPosition', { positionId: item.id })}
            onEdit={() => navigation.navigate('EditPosition', { positionId: item.id })}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              {positions.length === 0 ? 'No positions yet' : 'No matches for your filter'}
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: 16, paddingTop: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15 },
  chipsList: { maxHeight: 56 },
  chipsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { marginTop: 12, fontSize: 15 },
});
