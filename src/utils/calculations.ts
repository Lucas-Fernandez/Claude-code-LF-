import { Position, PortfolioTotals } from '@/types';

/**
 * Aggregate a list of positions into portfolio-wide rollups.
 *
 * Multiples are computed from aggregate cash flows (the correct way to roll up
 * a portfolio), while IRR is approximated as a NAV-weighted average of each
 * fund's IRR — IRRs are not additive, so a true pooled IRR would require the
 * underlying dated cash flows we don't store here. NAV-weighting is the
 * standard pragmatic proxy used on LP dashboards.
 */
export function computeTotals(positions: Position[]): PortfolioTotals {
  const empty: PortfolioTotals = {
    totalCommitment: 0,
    totalCalled: 0,
    totalDistributed: 0,
    totalNav: 0,
    totalUnfunded: 0,
    totalValue: 0,
    weightedNetIrr: 0,
    weightedGrossIrr: 0,
    netMoic: 0,
    grossMoic: 0,
    dpi: 0,
    tvpi: 0,
    rvpi: 0,
    positionCount: 0,
  };

  if (positions.length === 0) return empty;

  const sum = positions.reduce(
    (acc, p) => {
      acc.totalCommitment += p.commitment;
      acc.totalCalled += p.calledCapital;
      acc.totalDistributed += p.distributed;
      acc.totalNav += p.currentNav;
      acc.navWeightedNetIrr += p.irrNet * p.currentNav;
      acc.navWeightedGrossIrr += p.irrGross * p.currentNav;
      return acc;
    },
    {
      totalCommitment: 0,
      totalCalled: 0,
      totalDistributed: 0,
      totalNav: 0,
      navWeightedNetIrr: 0,
      navWeightedGrossIrr: 0,
    }
  );

  const totalValue = sum.totalNav + sum.totalDistributed;
  const called = sum.totalCalled || 1; // guard divide-by-zero

  return {
    totalCommitment: sum.totalCommitment,
    totalCalled: sum.totalCalled,
    totalDistributed: sum.totalDistributed,
    totalNav: sum.totalNav,
    totalUnfunded: Math.max(sum.totalCommitment - sum.totalCalled, 0),
    totalValue,
    weightedNetIrr: sum.totalNav > 0 ? sum.navWeightedNetIrr / sum.totalNav : 0,
    weightedGrossIrr: sum.totalNav > 0 ? sum.navWeightedGrossIrr / sum.totalNav : 0,
    netMoic: totalValue / called,
    grossMoic: totalValue / called,
    dpi: sum.totalDistributed / called,
    tvpi: totalValue / called,
    rvpi: sum.totalNav / called,
    positionCount: positions.length,
  };
}

/** Group total NAV by position type (for the allocation pie chart). */
export function navByType(positions: Position[]): Record<string, number> {
  return positions.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + p.currentNav;
    return acc;
  }, {});
}

/** Unique vintage years present, descending. */
export function uniqueVintages(positions: Position[]): number[] {
  return Array.from(new Set(positions.map((p) => p.vintageYear))).sort((a, b) => b - a);
}
