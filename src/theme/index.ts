/**
 * Centralized design tokens. Two palettes (light / dark) share the same shape
 * so screens can read `theme.colors.x` without caring which mode is active.
 *
 * Primary brand color is #2563eb (blue-600) per the Talipot spec.
 */

export interface ThemeColors {
  primary: string;
  primaryMuted: string;
  primaryText: string;

  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  border: string;
  divider: string;

  positive: string;
  negative: string;
  warning: string;

  /** Categorical palette used for charts (pie slices / bars). */
  chart: string[];

  /** Used by react-native-chart-kit which expects rgba(...) functions. */
  chartLabel: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number; xl: number };
  font: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    small: number;
    tiny: number;
  };
}

/** Shared categorical palette (blue-forward, professional). */
const CHART_PALETTE = [
  '#2563eb',
  '#0ea5e9',
  '#6366f1',
  '#8b5cf6',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#ec4899',
];

const baseTokens = {
  spacing: (n: number) => n * 4,
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  font: { h1: 28, h2: 22, h3: 18, body: 15, small: 13, tiny: 11 },
};

export const lightTheme: Theme = {
  mode: 'light',
  ...baseTokens,
  colors: {
    primary: '#2563eb',
    primaryMuted: '#dbeafe',
    primaryText: '#ffffff',

    background: '#f1f5f9',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    card: '#ffffff',

    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',

    border: '#e2e8f0',
    divider: '#eef2f7',

    positive: '#16a34a',
    negative: '#dc2626',
    warning: '#d97706',

    chart: CHART_PALETTE,
    chartLabel: '#475569',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  ...baseTokens,
  colors: {
    primary: '#3b82f6',
    primaryMuted: '#1e3a5f',
    primaryText: '#ffffff',

    background: '#0f172a',
    surface: '#1e293b',
    surfaceAlt: '#172033',
    card: '#1e293b',

    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',

    border: '#334155',
    divider: '#1f2b3e',

    positive: '#4ade80',
    negative: '#f87171',
    warning: '#fbbf24',

    chart: CHART_PALETTE,
    chartLabel: '#cbd5e1',
  },
};
