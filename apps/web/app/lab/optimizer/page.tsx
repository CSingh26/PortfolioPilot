import PageHeader from '../../../components/PageHeader';
import OptimizerLabClient from '../../../components/lab/OptimizerLabClient';

export default function OptimizerPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio Optimizer" subtitle="Allocation Lab" badge="MVO + Risk Parity" />
      <OptimizerLabClient />
    </div>
  );
}
