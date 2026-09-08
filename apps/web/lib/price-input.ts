import type { RiskRequest } from '@portfoliopilot/shared';

export function parsePriceCsv(csv: string, source: string): NonNullable<RiskRequest['history']> {
  const rows = csv.trim().split(/\r?\n/).map((line) => line.split(',').map((cell) => cell.trim()));
  const [header, ...data] = rows;
  if (!header || header[0].toLowerCase() !== 'date' || header.length < 2 || data.length < 3) {
    throw new Error('CSV requires date,SYMBOL,... and at least three complete daily price rows.');
  }
  const symbols = header.slice(1);
  if (new Set(symbols).size !== symbols.length) throw new Error('CSV symbols must be unique.');
  const prices: Record<string, number[]> = Object.fromEntries(symbols.map((t) => [t, []]));
  const dates: string[] = [];
  for (const row of data) {
    if (row.length !== header.length || !/^\d{4}-\d{2}-\d{2}$/.test(row[0])) {
      throw new Error('Every row needs an ISO date and a price for every symbol; quoted CSV is unsupported.');
    }
    dates.push(row[0]);
    symbols.forEach((symbol, i) => {
      const value = Number(row[i + 1]);
      if (!Number.isFinite(value) || value <= 0) throw new Error('Prices must be finite and positive.');
      prices[symbol].push(value);
    });
  }
  return { dates, prices, source };
}

export function teachingFixture(): string {
  const lines = ['date,EQUITY,BONDS,GOLD'];
  const values = [100, 100, 100];
  const date = new Date('2023-01-02T00:00:00Z');
  for (let i = 0; i < 300; ) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) {
      // Deterministic teaching paths, deliberately not market observations.
      const shock = i === 170 ? -0.08 : 0;
      const returns = [0.0004 + .009 * Math.sin(i * 1.73) + shock,
        .00012 + .003 * Math.cos(i * .91) - shock * .15,
        .0002 + .006 * Math.sin(i * 1.13) - shock * .25];
      values.forEach((value, j) => { values[j] = value * (1 + returns[j]); });
      lines.push(`${date.toISOString().slice(0, 10)},${values.map((v) => v.toFixed(6)).join(',')}`);
      i += 1;
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return lines.join('\n');
}
