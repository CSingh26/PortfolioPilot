import PageHeader from '../../components/PageHeader';
import RunHistory from '../../components/runs/RunHistory';

export default function RunsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Run History" subtitle="Saved Runs" badge="Reproducible" />
      <RunHistory />
    </div>
  );
}
