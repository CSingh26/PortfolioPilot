import PageHeader from '../../components/PageHeader';
import RiskDashboard from '../../components/risk/RiskDashboard';

export default function RiskPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Risk Center" subtitle="Risk Analytics" badge="VaR / CVaR" />
      <RiskDashboard />
    </div>
  );
}
