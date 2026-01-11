import PageHeader from '../../components/PageHeader';
import LiveMarketClient from '../../components/live/LiveMarketClient';

export default function LivePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Live Markets" subtitle="Real-Time Monitor" badge="Finnhub WebSocket" />
      <LiveMarketClient />
    </div>
  );
}
