/**
 * Core domain types for the Talipot Capital LP dashboard.
 *
 * A `Position` represents a single private markets fund/investment commitment
 * that the LP (Limited Partner) holds. All monetary values are stored as raw
 * USD numbers (not cents) to keep the math readable.
 */

/** High-level asset class buckets used for allocation + filtering. */
export type PositionType =
  | 'VC'
  | 'PE'
  | 'Real Estate'
  | 'Credit'
  | 'Growth'
  | 'Infrastructure'
  | 'Fund of Funds'
  | 'Secondaries'
  | 'Other';

/** The list above, as a runtime array for pickers / filters. */
export const POSITION_TYPES: PositionType[] = [
  'VC',
  'PE',
  'Real Estate',
  'Credit',
  'Growth',
  'Infrastructure',
  'Fund of Funds',
  'Secondaries',
  'Other',
];

export interface Position {
  id: string;
  name: string;
  type: PositionType;
  manager: string;

  /** Total amount the LP has legally committed to the fund (USD). */
  commitment: number;
  /** Capital actually drawn down / called by the GP so far (USD). */
  calledCapital: number;
  /** Cash + stock distributed back to the LP so far (USD). */
  distributed: number;
  /** Current reported Net Asset Value of the LP's stake (USD). */
  currentNav: number;

  /** Internal Rate of Return as a decimal (0.25 == 25%). */
  irrGross: number;
  irrNet: number;

  /** Multiple On Invested Capital (e.g. 2.4 == 2.4x). */
  moicGross: number;
  moicNet: number;

  /** Distributions To Paid-In capital (realized multiple). */
  dpi: number;
  /** Net Total Value To Paid-In ((NAV + distributed) / called), net of fees. */
  netTvpi: number;

  vintageYear: number;

  /** Optional free-text investment thesis / notes. */
  thesis?: string;

  /** Does the LP hold a seat on the Limited Partner Advisory Committee? */
  lpacSeat: boolean;
  /** Is there an active co-investment opportunity alongside this fund? */
  coInvestOpportunity: boolean;

  /** ISO timestamp of last edit, used for sorting / display. */
  updatedAt: string;
}

/** Shape used by the Add/Edit form before an id + timestamps are attached. */
export type PositionInput = Omit<Position, 'id' | 'updatedAt'>;

/** Aggregated, portfolio-wide rollup numbers. */
export interface PortfolioTotals {
  totalCommitment: number;
  totalCalled: number;
  totalDistributed: number;
  totalNav: number;
  /** Uncalled commitment ("dry powder" the LP still owes). */
  totalUnfunded: number;
  /** NAV + distributions = total value created. */
  totalValue: number;

  /** NAV-weighted average net IRR across positions. */
  weightedNetIrr: number;
  weightedGrossIrr: number;

  /** Portfolio-level multiples derived from aggregate cash flows. */
  netMoic: number;
  grossMoic: number;
  dpi: number;
  tvpi: number;
  rvpi: number;

  positionCount: number;
}
