import PageHeader from '../../../components/PageHeader';
import Panel from '../../../components/Panel';

export default function MathPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Quant Math" subtitle="Derivations" badge="MVO / Risk Parity" />
      <Panel title="Documentation" subtitle="Mathematical Notes">
        <div className="space-y-4 text-sm text-muted">
          <p>
            The full derivations for MVO, Risk Parity, and CVaR optimization are rendered from
            docs/MATH.md.
          </p>
          <div className="rounded-2xl border border-dashed border-border bg-canvas p-4">
            Markdown rendering placeholder.
          </div>
        </div>
      </Panel>
    </div>
  );
}
