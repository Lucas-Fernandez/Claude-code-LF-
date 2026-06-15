/** Number / currency formatting helpers shared across screens. */

/**
 * Compact USD formatting for dashboard cards, e.g. 64_000_000 -> "$64.0M".
 * Keeps big institutional numbers glanceable on a phone.
 */
export function formatCompactUsd(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/** Full USD with thousands separators, e.g. "$64,000,000". */
export function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/** Decimal ratio (0.253) -> "25.3%". */
export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Multiple, e.g. 2.4 -> "2.40x". */
export function formatMultiple(value: number, digits = 2): string {
  return `${value.toFixed(digits)}x`;
}
