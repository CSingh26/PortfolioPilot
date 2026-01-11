import PageHeader from '../../../components/PageHeader';
import Panel from '../../../components/Panel';

export default function OptimizerPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio Optimizer" subtitle="Allocation Lab" badge="MVO + Risk Parity" />
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Objective" subtitle="Optimization Inputs">
          <div className="space-y-3 text-sm text-muted">
            <p>Define constraints, risk targets, and objective functions for the optimizer.</p>
            <div className="rounded-2xl border border-dashed border-border bg-canvas p-4">
              Objective + constraint form placeholder.
            </div>
          </div>
        </Panel>
        <Panel title="Frontier" subtitle="Efficient Frontier">
          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Efficient frontier chart placeholder.
          </div>
        </Panel>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Weights" subtitle="Optimized Allocation">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Allocation weights chart placeholder.
          </div>
        </Panel>
        <Panel title="Risk Contributions" subtitle="Decomposition">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Risk contribution bar chart placeholder.
          </div>
        </Panel>
      </section>
    </div>
  );
}
