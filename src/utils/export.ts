import { Position, PortfolioTotals } from '@/types';
import { formatMultiple, formatPercent, formatUsd } from './format';

/** CSV-escape a single cell (wrap in quotes if it contains , " or newline). */
function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build a full CSV export of every position. */
export function positionsToCsv(positions: Position[]): string {
  const headers = [
    'Name',
    'Type',
    'Manager',
    'Vintage',
    'Commitment',
    'Called',
    'Distributed',
    'NAV',
    'IRR Gross',
    'IRR Net',
    'MOIC Gross',
    'MOIC Net',
    'DPI',
    'Net TVPI',
    'LPAC Seat',
    'Co-Invest',
    'Thesis',
  ];

  const rows = positions.map((p) =>
    [
      p.name,
      p.type,
      p.manager,
      p.vintageYear,
      p.commitment,
      p.calledCapital,
      p.distributed,
      p.currentNav,
      p.irrGross,
      p.irrNet,
      p.moicGross,
      p.moicNet,
      p.dpi,
      p.netTvpi,
      p.lpacSeat ? 'Yes' : 'No',
      p.coInvestOpportunity ? 'Yes' : 'No',
      p.thesis ?? '',
    ]
      .map(csvCell)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/** Human-readable plain-text summary suitable for sharing / pasting. */
export function portfolioToText(positions: Position[], totals: PortfolioTotals): string {
  const lines: string[] = [];
  lines.push('TALIPOT CAPITAL — LP PORTFOLIO SUMMARY');
  lines.push(new Date().toLocaleDateString('en-US', { dateStyle: 'long' }));
  lines.push('========================================');
  lines.push('');
  lines.push(`Positions:        ${totals.positionCount}`);
  lines.push(`Total Committed:  ${formatUsd(totals.totalCommitment)}`);
  lines.push(`Total Called:     ${formatUsd(totals.totalCalled)}`);
  lines.push(`Unfunded:         ${formatUsd(totals.totalUnfunded)}`);
  lines.push(`Total NAV:        ${formatUsd(totals.totalNav)}`);
  lines.push(`Distributed:      ${formatUsd(totals.totalDistributed)}`);
  lines.push(`Total Value:      ${formatUsd(totals.totalValue)}`);
  lines.push('');
  lines.push(`Net IRR (wtd):    ${formatPercent(totals.weightedNetIrr)}`);
  lines.push(`Net TVPI:         ${formatMultiple(totals.tvpi)}`);
  lines.push(`DPI:              ${formatMultiple(totals.dpi)}`);
  lines.push(`Net MOIC:         ${formatMultiple(totals.netMoic)}`);
  lines.push('');
  lines.push('POSITIONS');
  lines.push('----------------------------------------');
  positions.forEach((p) => {
    lines.push(`• ${p.name} (${p.type}, ${p.vintageYear})`);
    lines.push(`    ${p.manager}`);
    lines.push(
      `    Commit ${formatUsd(p.commitment)} | NAV ${formatUsd(p.currentNav)} | Net IRR ${formatPercent(
        p.irrNet
      )} | TVPI ${formatMultiple(p.netTvpi)}`
    );
  });

  return lines.join('\n');
}
