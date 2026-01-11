import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard label="Net Asset Value" value="$12.48M" change="+2.4% MTD" />
        <KpiCard label="Sharpe Ratio" value="1.42" change="Rolling 12M" />
        <KpiCard label="Max Drawdown" value="-8.6%" change="Last 3Y" />
        <KpiCard label="Cash Utilization" value="94%" change="Target 95%" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel title="Performance" subtitle="Equity Curve">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Equity curve visualization will render here.
          </div>
        </Panel>
        <Panel title="Risk" subtitle="Stress Overview">
          <div className="space-y-4 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>99% VaR (1D)</span>
              <span className="font-semibold text-ink">-2.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Expected Shortfall</span>
              <span className="font-semibold text-ink">-3.0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Beta vs SPY</span>
              <span className="font-semibold text-ink">0.87</span>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-canvas p-4 text-xs text-muted">
              Stress scenarios and correlation heatmaps live here.
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="Allocations" subtitle="Current Weights">
          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Allocation breakdown chart placeholder.
          </div>
        </Panel>
        <Panel title="Execution" subtitle="Rebalance Cadence">
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Next rebalance</span>
              <span className="font-semibold text-ink">Apr 05, 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Turnover YTD</span>
              <span className="font-semibold text-ink">38%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg. cost</span>
              <span className="font-semibold text-ink">6 bps</span>
            </div>
          </div>
        </Panel>
        <Panel title="Data Health" subtitle="Freshness & Latency">
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Last cache refresh</span>
              <span className="font-semibold text-ink">2m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Finnhub latency</span>
              <span className="font-semibold text-ink">180ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Universe coverage</span>
              <span className="font-semibold text-ink">10 / 10</span>
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
