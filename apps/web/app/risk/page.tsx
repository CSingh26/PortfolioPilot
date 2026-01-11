import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';

export default function RiskPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Risk Center" subtitle="Risk Analytics" badge="VaR / CVaR" />
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Risk Curve" subtitle="VaR / CVaR Over Time">
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            VaR / CVaR time series placeholder.
          </div>
        </Panel>
        <Panel title="Stress" subtitle="Scenario Shocks">
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>2008 Replay</span>
              <span className="font-semibold text-ink">-21.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>COVID Shock</span>
              <span className="font-semibold text-ink">-14.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rates Spike</span>
              <span className="font-semibold text-ink">-9.8%</span>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-canvas p-4 text-xs text-muted">
              Stress module details placeholder.
            </div>
          </div>
        </Panel>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Correlation Matrix" subtitle="Daily Returns">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Correlation heatmap placeholder.
          </div>
        </Panel>
        <Panel title="Drawdowns" subtitle="Peak-to-Trough">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Drawdown chart placeholder.
          </div>
        </Panel>
      </section>
    </div>
  );
}
