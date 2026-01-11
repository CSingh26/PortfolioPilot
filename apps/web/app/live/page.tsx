import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';

export default function LivePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Live Markets" subtitle="Real-Time Monitor" badge="Finnhub WebSocket" />
      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="Quotes" subtitle="Live Tickers">
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Real-time quotes table placeholder.
          </div>
        </Panel>
        <Panel title="Paper PnL" subtitle="Day Performance">
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
            Paper PnL panel placeholder.
          </div>
        </Panel>
        <Panel title="Latency" subtitle="Feed Health">
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>WebSocket status</span>
              <span className="font-semibold text-ink">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last tick</span>
              <span className="font-semibold text-ink">3s ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Symbols</span>
              <span className="font-semibold text-ink">10</span>
            </div>
          </div>
        </Panel>
      </section>
      <Panel title="Market Tape" subtitle="Price Stream">
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-canvas text-sm text-muted">
          Streaming tape placeholder.
        </div>
      </Panel>
    </div>
  );
}
