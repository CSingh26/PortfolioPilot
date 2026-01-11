'use client';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type HeatmapRow = {
  year: string;
  values: (number | null)[];
};

type MonthlyHeatmapProps = {
  title: string;
  subtitle: string;
  rows: HeatmapRow[];
};

function cellColor(value: number | null): string {
  if (value === null) {
    return 'bg-canvas text-muted';
  }
  if (value > 0.03) {
    return 'bg-emerald-200 text-emerald-900';
  }
  if (value > 0) {
    return 'bg-emerald-100 text-emerald-900';
  }
  if (value < -0.03) {
    return 'bg-rose-200 text-rose-900';
  }
  if (value < 0) {
    return 'bg-rose-100 text-rose-900';
  }
  return 'bg-canvas text-muted';
}

export default function MonthlyHeatmap({ title, subtitle, rows }: MonthlyHeatmapProps) {
  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      <header className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{title}</h3>
        <p className="mt-2 text-lg font-semibold text-ink">{subtitle}</p>
      </header>
      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-[80px_repeat(12,1fr)] gap-2 text-xs">
          <div />
          {months.map((month) => (
            <div key={month} className="text-center text-muted">
              {month}
            </div>
          ))}
          {rows.map((row) => (
            <div key={row.year} className="contents">
              <div className="flex items-center text-sm font-semibold text-ink">{row.year}</div>
              {row.values.map((value, index) => (
                <div
                  key={`${row.year}-${index}`}
                  className={`rounded-lg px-2 py-2 text-center ${cellColor(value)}`}
                >
                  {value === null ? '—' : `${(value * 100).toFixed(1)}%`}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
