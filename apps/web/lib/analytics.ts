export type SeriesPoint = { date: string; value: number };

export type HeatmapRow = { year: string; values: (number | null)[] };

export function rollingSharpe(series: SeriesPoint[], window = 63): SeriesPoint[] {
  const output: SeriesPoint[] = [];
  for (let i = 0; i < series.length; i += 1) {
    if (i < window) {
      continue;
    }
    const slice = series.slice(i - window, i);
    const returns = slice.map((point) => point.value);
    const mean = returns.reduce((acc, val) => acc + val, 0) / returns.length;
    const variance =
      returns.reduce((acc, val) => acc + (val - mean) ** 2, 0) / (returns.length - 1);
    const vol = Math.sqrt(variance);
    if (vol === 0) {
      continue;
    }
    const sharpe = (mean / vol) * Math.sqrt(252);
    output.push({ date: series[i].date, value: sharpe });
  }
  return output;
}

export function rollingVol(series: SeriesPoint[], window = 63): SeriesPoint[] {
  const output: SeriesPoint[] = [];
  for (let i = 0; i < series.length; i += 1) {
    if (i < window) {
      continue;
    }
    const slice = series.slice(i - window, i);
    const returns = slice.map((point) => point.value);
    const mean = returns.reduce((acc, val) => acc + val, 0) / returns.length;
    const variance =
      returns.reduce((acc, val) => acc + (val - mean) ** 2, 0) / (returns.length - 1);
    const vol = Math.sqrt(variance) * Math.sqrt(252);
    output.push({ date: series[i].date, value: vol });
  }
  return output;
}

export function monthlyHeatmap(series: SeriesPoint[]): HeatmapRow[] {
  const byMonth = new Map<string, number[]>();
  series.forEach((point) => {
    const date = new Date(point.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const existing = byMonth.get(key) ?? [];
    existing.push(point.value);
    byMonth.set(key, existing);
  });

  const byYear = new Map<string, (number | null)[]>();
  byMonth.forEach((values, key) => {
    const [year, month] = key.split('-');
    const monthIndex = Number(month);
    const compounded = values.reduce((acc, val) => acc * (1 + val), 1) - 1;
    const row = byYear.get(year) ?? Array(12).fill(null);
    row[monthIndex] = compounded;
    byYear.set(year, row);
  });

  return Array.from(byYear.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, values]) => ({ year, values }));
}

export function weightsToStackedData(
  dates: string[],
  weights: Record<string, number[]>
): Record<string, string | number>[] {
  return dates.map((date, index) => {
    const row: Record<string, string | number> = { date };
    Object.entries(weights).forEach(([symbol, values]) => {
      row[symbol] = values[index] ?? 0;
    });
    return row;
  });
}
