'use client';

import { useState } from 'react';
import type { RiskMetrics, RiskRequest } from '@portfoliopilot/shared';
import Panel from '../Panel';
import LineChartCard from '../charts/LineChartCard';
import { getRiskMetrics } from '../../lib/api';
import { parsePriceCsv, teachingFixture } from '../../lib/price-input';

const pct = (value: number | null | undefined) => value == null ? 'Undefined' : `${(value * 100).toFixed(2)}%`;
const num = (value: number | null) => value == null ? 'Undefined' : value.toFixed(2);
const inputClass = 'mt-1 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm';

function Metric({ title, value, interpretation }: { title: string; value: string; interpretation: string }) {
  return <div className="rounded-2xl border border-border bg-white p-5"><p className="text-xs uppercase tracking-widest text-muted">{title}</p><p className="my-3 text-3xl font-semibold text-ink">{value}</p><p className="text-xs leading-relaxed text-muted">{interpretation}</p></div>;
}

export default function RiskDashboard() {
  const [symbols, setSymbols] = useState('SPY, TLT, GLD');
  const [weights, setWeights] = useState('0.6, 0.3, 0.1');
  const [shocks, setShocks] = useState('-0.2, -0.05, 0.1');
  const [benchmark, setBenchmark] = useState('SPY');
  const [start, setStart] = useState('2023-01-01');
  const [end, setEnd] = useState('2025-01-01');
  const [confidence, setConfidence] = useState(.95);
  const [rf, setRf] = useState(.04);
  const [csv, setCsv] = useState('');
  const [source, setSource] = useState('User-supplied adjusted prices');
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadTeaching() {
    setSymbols('EQUITY, BONDS, GOLD'); setWeights('0.6, 0.3, 0.1');
    setBenchmark('EQUITY'); setStart('2023-01-01'); setEnd('2025-01-01');
    setCsv(teachingFixture()); setSource('SYNTHETIC TEACHING DATA — deterministic paths, not market returns');
    setMetrics(null); setError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null); setMetrics(null);
    try {
      const tickers = symbols.split(',').map((t) => t.trim().toUpperCase());
      const w = weights.split(',').map(Number); const s = shocks.split(',').map(Number);
      if (w.length !== tickers.length || s.length !== tickers.length) throw new Error('Provide one weight and one shock per asset.');
      const request: RiskRequest = { tickers, start, end, alpha: confidence, benchmark, risk_free: rf,
        weights: Object.fromEntries(tickers.map((t, i) => [t, w[i]])),
        shocks: Object.fromEntries(tickers.map((t, i) => [t, s[i]])),
        ...(csv.trim() ? { history: parsePriceCsv(csv, source) } : {}) };
      setMetrics(await getRiskMetrics(request));
    } catch (err) { setError(err instanceof Error ? err.message : 'Calculation unavailable'); }
    finally { setBusy(false); }
  }

  function exportResults() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'portfoliopilot-risk.json'; a.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-6">
    <div className="rounded-2xl bg-ink p-6 text-white"><p className="text-xs uppercase tracking-[.25em] text-teal-200">Allocation → risk → evidence</p><h2 className="mt-3 text-2xl font-semibold">Does your capital allocation match your risk allocation?</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">Compare total volatility, downside and benchmark sensitivity. Then ask which holdings actually carry the risk. Results describe the supplied historical sample; they do not forecast performance.</p></div>
    <Panel title="Research inputs" subtitle="Daily adjusted prices · decimal weights and shocks">
      <form onSubmit={onSubmit} onChange={() => setMetrics(null)} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-xs text-muted">Assets<input className={inputClass} value={symbols} onChange={e => setSymbols(e.target.value)} required /></label>
          <label className="text-xs text-muted">Weights (sum to 1)<input className={inputClass} value={weights} onChange={e => setWeights(e.target.value)} required /></label>
          <label className="text-xs text-muted">Hypothetical shocks (−0.2 = −20%)<input className={inputClass} value={shocks} onChange={e => setShocks(e.target.value)} required /></label>
          <label className="text-xs text-muted">Start<input type="date" className={inputClass} value={start} onChange={e => setStart(e.target.value)} required /></label>
          <label className="text-xs text-muted">End (exclusive)<input type="date" className={inputClass} value={end} onChange={e => setEnd(e.target.value)} required /></label>
          <label className="text-xs text-muted">Benchmark column / symbol<input className={inputClass} value={benchmark} onChange={e => setBenchmark(e.target.value.toUpperCase())} required /></label>
          <label className="text-xs text-muted">VaR confidence<input type="number" step=".01" min=".51" max=".99" className={inputClass} value={confidence} onChange={e => setConfidence(Number(e.target.value))} /></label>
          <label className="text-xs text-muted">Annual effective risk-free rate<input type="number" step=".005" min="-.99" max="1" className={inputClass} value={rf} onChange={e => setRf(Number(e.target.value))} /></label>
          <div className="flex items-end"><button type="button" onClick={loadTeaching} className="w-full rounded-xl border border-border px-3 py-2 text-sm">Load labeled teaching data</button></div>
        </div>
        <details className="rounded-xl border border-border p-4" open={!!csv}>
          <summary className="cursor-pointer text-sm font-medium">Supply your own CSV (optional)</summary>
          <p className="my-3 text-xs text-muted">Use date,SYMBOL,... with complete daily adjusted prices, including the benchmark. Without CSV, Yahoo Finance is requested. Missing data produces an error.</p>
          <label className="block text-xs text-muted">Data source / provenance<input className={inputClass} value={source} onChange={e => setSource(e.target.value)} /></label>
          <input aria-label="Upload adjusted price CSV" type="file" accept=".csv,text/csv" className="my-3 text-xs" onChange={async e => { const file = e.target.files?.[0]; if (file) { setCsv(await file.text()); setSource(`User file: ${file.name}`); setMetrics(null); } }} />
          <textarea aria-label="Adjusted price CSV" className={`${inputClass} font-mono`} rows={4} value={csv} onChange={e => setCsv(e.target.value)} placeholder="date,SPY,TLT,GLD" />
          {!!csv && <button type="button" className="mt-2 text-xs text-accent" onClick={() => { setCsv(''); setMetrics(null); }}>Clear supplied data</button>}
        </details>
        <button type="submit" disabled={busy} className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Computing risk…' : 'Analyze allocation'}</button>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        </fieldset>
      </form>
    </Panel>
    {metrics && <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4"><div><p className="text-sm font-semibold">{metrics.metadata.source}</p><p className="mt-1 text-xs text-muted">{metrics.metadata.start} → {metrics.metadata.end} · {metrics.metadata.observations} daily returns · benchmark {metrics.metadata.benchmark}</p></div><button onClick={exportResults} className="rounded-lg border border-teal-300 px-3 py-2 text-xs">Export evidence JSON</button></div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Annual volatility" value={pct(metrics.volatility)} interpretation="Typical dispersion, scaled by √252. It treats gains and losses equally and misses liquidity and tail risk." />
        <Metric title="Historical tail average" value={pct(metrics.hist_cvar)} interpretation={`Average daily return at or below the ${(metrics.metadata.confidence * 100).toFixed(0)}% historical VaR threshold. A signed return, not a maximum possible loss.`} />
        <Metric title="Maximum drawdown" value={pct(metrics.max_drawdown)} interpretation="Worst observed peak-to-trough decline, including initial capital. Future drawdowns can exceed this sample." />
        <Metric title="Scenario return" value={pct(metrics.stress_return)} interpretation="Weighted sum of your one-period asset shocks. Hypothetical and linear; no probability, costs or liquidity effects." />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <LineChartCard title="Historical wealth" subtitle="Initial capital = 1 · constant daily weights · no costs" data={metrics.equity_curve.dates.map((date, i) => ({ date, value: metrics.equity_curve.values[i] }))} color="#0F766E" />
        <Panel title="Who carries the risk?" subtitle="Euler contributions to annual portfolio volatility">
          <div className="space-y-4">{Object.entries(metrics.risk_contribution).map(([asset, risk]) => <div key={asset}><div className="flex justify-between text-sm"><span>{asset} <span className="text-xs text-muted">{pct(metrics.asset_metrics[asset].weight)} capital</span></span><strong>{pct(risk)} vol contribution</strong></div><div className="mt-2 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-accent" style={{ width: `${Math.min(100, Math.abs(risk / (metrics.volatility || 1)) * 100)}%` }} /></div></div>)}</div>
          <p className="mt-5 text-xs leading-relaxed text-muted">Contributions sum to portfolio volatility. A negative contribution indicates a hedge in this sample. Diversification ratio {num(metrics.diversification_ratio)} compares weighted standalone volatility with combined risk; correlations can change under stress.</p>
        </Panel>
      </section>
      <Panel title="Return quality & market exposure" subtitle="Annual arithmetic estimates unless labeled otherwise">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric title="Sharpe" value={num(metrics.sharpe)} interpretation="Annualized excess return per unit of total volatility. Sensitive to sample, risk-free assumption and non-normal tails." />
          <Metric title="Sortino" value={num(metrics.sortino)} interpretation={`Excess return per unit of downside deviation (${pct(metrics.downside_deviation)}), measured over all observations relative to the risk-free hurdle.`} />
          <Metric title="Benchmark beta" value={num(metrics.beta)} interpretation="Historical sensitivity to the selected benchmark. Beta 0.5 means half its covariance-based exposure, not half the potential loss." />
        </div>
        <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <p>Historical expected return: <strong>{pct(metrics.expected_return)}</strong> · arithmetic mean × 252</p><p>Geometric CAGR: <strong>{pct(metrics.cagr)}</strong> · compounded sample growth</p>
          <p>Excess return: <strong>{pct(metrics.excess_return)}</strong> · daily effective risk-free hurdle deducted</p><p>CAPM implied return: <strong>{pct(metrics.capm_return)}</strong> · risk-free + beta × benchmark excess</p>
          <p>CAPM alpha: <strong>{pct(metrics.alpha)}</strong> · sample return unexplained by benchmark exposure</p><p>Benchmark arithmetic return: <strong>{pct(metrics.benchmark_return)}</strong> · same dates</p>
        </div>
        <p className="mt-4 text-xs text-muted">CAPM is a simplifying single-factor model. Alpha is descriptive, without a significance claim or proof of skill. Undefined ratios have zero denominators.</p>
      </Panel>
      <section className="grid gap-6 lg:grid-cols-2">
        <LineChartCard title="Rolling annual volatility" subtitle="63 daily observations · √252 scaling" data={metrics.rolling_vol.dates.map((date, i) => ({ date, value: metrics.rolling_vol.values[i] }))} color="#64748B" valueFormatter={pct} />
        <LineChartCard title="Rolling Sharpe" subtitle="63-day excess-return window · unstable short-sample estimate" data={metrics.rolling_sharpe.dates.map((date, i) => ({ date, value: metrics.rolling_sharpe.values[i] }))} color="#0F766E" />
      </section>
      <Panel title="Dependence & tail assumptions" subtitle="Correlation is descriptive; Gaussian tail models can understate extremes">
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Correlation</th>{Object.keys(metrics.correlation).map(t => <th className="p-2" key={t}>{t}</th>)}</tr></thead><tbody>{Object.entries(metrics.correlation).map(([t, row]) => <tr key={t}><th className="p-2">{t}</th>{Object.entries(row).map(([u, x]) => <td className="p-2" key={u} style={{ backgroundColor: x == null ? 'transparent' : `rgba(15,118,110,${Math.abs(x) * .2})` }}>{num(x)}</td>)}</tr>)}</tbody></table></div>
        <div className="mt-5 grid gap-4 text-sm md:grid-cols-4"><p>Historical VaR <strong>{pct(metrics.hist_var)}</strong></p><p>Historical CVaR <strong>{pct(metrics.hist_cvar)}</strong></p><p>Gaussian VaR <strong>{pct(metrics.param_var)}</strong></p><p>Gaussian CVaR <strong>{pct(metrics.param_cvar)}</strong></p></div>
        <p className="mt-4 text-xs text-muted">All four are signed one-day tail returns at {(metrics.metadata.confidence * 100).toFixed(0)}% confidence. Historical VaR uses linear quantiles; CVaR averages observed returns below that threshold. Gaussian estimates assume normal daily returns.</p>
        <details className="mt-4 text-sm"><summary className="cursor-pointer">Asset estimates & annual covariance</summary><pre className="mt-3 overflow-auto rounded-xl bg-canvas p-3 text-xs">{JSON.stringify({ assets: metrics.asset_metrics, covariance: metrics.covariance }, null, 2)}</pre><p className="mt-2 text-xs text-muted">Asset estimates use the same sample; covariance is in annual squared-return units and feeds wᵀΣw.</p></details>
      </Panel>
      <Panel title="Evidence & limitations" subtitle="Reproducible inputs, explicit assumptions">
        <ul className="list-disc space-y-2 pl-5 text-xs text-muted">{metrics.metadata.warnings.map(w => <li key={w}>{w}</li>)}</ul><p className="mt-4 text-xs text-muted">{metrics.metadata.assumptions}</p><p className="mt-3 break-all font-mono text-xs text-muted">Input SHA-256: {metrics.metadata.input_sha256}</p>
      </Panel>
    </>}
  </div>;
}
