import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';

export default function RunsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Run History" subtitle="Saved Runs" badge="Reproducible" />
      <Panel title="Backtest Runs" subtitle="Saved Configurations">
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
          Run history table placeholder.
        </div>
      </Panel>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Run Snapshot" subtitle="Configuration">
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Run config detail placeholder.
          </div>
        </Panel>
        <Panel title="Export" subtitle="Shareable Artifacts">
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Export download placeholder.
          </div>
        </Panel>
      </section>
    </div>
  );
}
