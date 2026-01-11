import PageHeader from '../../../components/PageHeader';
import BacktestLabClient from '../../../components/lab/BacktestLabClient';

export default function BacktestPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Backtest Lab" subtitle="Strategy Lab" badge="Vectorized Engine" />
      <BacktestLabClient />
    </div>
  );
}
