import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SAMPLE_POSITIONS } from '@/data/sampleData';
import { Position, PositionInput } from '@/types';
import { computeTotals } from '@/utils/calculations';

const STORAGE_KEY = '@talipot/positions';

interface PortfolioContextValue {
  positions: Position[];
  loading: boolean;
  /** Recomputed portfolio rollups (memoized). */
  totals: ReturnType<typeof computeTotals>;
  addPosition: (input: PositionInput) => Promise<Position>;
  updatePosition: (id: string, input: PositionInput) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
  getPosition: (id: string) => Position | undefined;
  /** Re-read from storage (used by pull-to-refresh). */
  refresh: () => Promise<void>;
  /** Restore the bundled sample portfolio. */
  resetToSample: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

function generateId(): string {
  return `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  /** Load from AsyncStorage, falling back to sample data on first run. */
  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPositions(JSON.parse(raw) as Position[]);
      } else {
        // First launch: seed with sample data and persist it.
        setPositions(SAMPLE_POSITIONS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_POSITIONS));
      }
    } catch (err) {
      console.warn('Failed to load portfolio, using sample data.', err);
      setPositions(SAMPLE_POSITIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Persist a new positions array and update state in one place. */
  const persist = useCallback(async (next: Position[]) => {
    setPositions(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addPosition = useCallback(
    async (input: PositionInput) => {
      const position: Position = {
        ...input,
        id: generateId(),
        updatedAt: new Date().toISOString(),
      };
      await persist([position, ...positions]);
      return position;
    },
    [positions, persist]
  );

  const updatePosition = useCallback(
    async (id: string, input: PositionInput) => {
      const next = positions.map((p) =>
        p.id === id ? { ...input, id, updatedAt: new Date().toISOString() } : p
      );
      await persist(next);
    },
    [positions, persist]
  );

  const deletePosition = useCallback(
    async (id: string) => {
      await persist(positions.filter((p) => p.id !== id));
    },
    [positions, persist]
  );

  const getPosition = useCallback(
    (id: string) => positions.find((p) => p.id === id),
    [positions]
  );

  const resetToSample = useCallback(async () => {
    await persist(SAMPLE_POSITIONS);
  }, [persist]);

  const totals = useMemo(() => computeTotals(positions), [positions]);

  const value = useMemo<PortfolioContextValue>(
    () => ({
      positions,
      loading,
      totals,
      addPosition,
      updatePosition,
      deletePosition,
      getPosition,
      refresh: load,
      resetToSample,
    }),
    [
      positions,
      loading,
      totals,
      addPosition,
      updatePosition,
      deletePosition,
      getPosition,
      load,
      resetToSample,
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return ctx;
}
