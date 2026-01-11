import PageHeader from '../../../components/PageHeader';
import Panel from '../../../components/Panel';

export default function BacktestPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Backtest Lab" subtitle="Strategy Lab" badge="Vectorized Engine" />
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Strategy" subtitle="Configure Backtest">
          <div className="space-y-3 text-sm text-muted">
            <p>Select universe, rebalance cadence, and constraints to run a reproducible backtest.</p>
            <div className="rounded-2xl border border-dashed border-border bg-canvas p-4">
              Inputs and strategy selector will appear here.
            </div>
          </div>
        </Panel>
        <Panel title="Run Summary" subtitle="Live Preview">
          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Preview metrics + warnings placeholder.
          </div>
        </Panel>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Equity Curve" subtitle="Portfolio vs Benchmark">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Equity and drawdown charts render here.
          </div>
        </Panel>
        <Panel title="Attribution" subtitle="Drivers & Exposure">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Factor exposure and attribution placeholder.
          </div>
        </Panel>
      </section>
    </div>
  );
}
