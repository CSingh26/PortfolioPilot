export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-8 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Portfolio Intelligence</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Institutional Portfolio Workspace</h2>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted">Universe</p>
        <p className="text-sm font-medium text-ink">SPY, QQQ, IWM, EFA, EEM</p>
      </div>
    </header>
  );
}
