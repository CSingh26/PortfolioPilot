'use client';

import { useMemo, useState } from 'react';
import type { FactorRegressionResult, RiskMetrics, RiskRequest } from '@portfoliopilot/shared';
import KpiCard from '../KpiCard';
import Panel from '../Panel';
import LineChartCard from '../charts/LineChartCard';
import { getFactorRegression, getRiskMetrics } from '../../lib/api';

const defaultRequest: RiskRequest = {
  tickers: ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM'],
  start: '2019-01-01',
  end: '2024-12-31',
  alpha: 0.95
};

export default function RiskDashboard() {
  const [form, setForm] = useState<RiskRequest>(defaultRequest);
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [factors, setFactors] = useState<FactorRegressionResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);

  const factorRows = useMemo(() => {
    if (!factors) return [];
    return Object.entries(factors.coefficients).map(([name, value]) => ({
      name,
      value,
      tstat: factors.tstats[name] ?? 0
    }));
  }, [factors]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      const [metricsResponse, factorsResponse] = await Promise.all([
        getRiskMetrics(form),
        getFactorRegression(form)
      ]);
      setMetrics(metricsResponse);
      setFactors(factorsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch risk metrics');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className="space-y-6">
      <Panel title="Risk Inputs" subtitle="Portfolio Risk Snapshot">
        <form className="grid gap-4 lg:grid-cols-4" onSubmit={onSubmit}>
          <div className="lg:col-span-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Tickers</label>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.tickers.join(', ')}
              onChange={(event) =>
                setForm({
                  ...form,
                  tickers: event.target.value
                    .split(',')
                    .map((ticker) => ticker.trim().toUpperCase())
                    .filter(Boolean)
                })
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Start</label>
            <input
              type="date"
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.start}
              onChange={(event) => setForm({ ...form, start: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">End</label>
            <input
              type="date"
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.end}
              onChange={(event) => setForm({ ...form, end: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Confidence</label>
            <input
              type="number"
              step="0.01"
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.alpha}
              onChange={(event) => setForm({ ...form, alpha: Number(event.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Loading…' : 'Load Risk'}
            </button>
          </div>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
      </Panel>

      {metrics ? (
        <section className="grid gap-4 lg:grid-cols-4">
          <KpiCard label="Hist VaR" value={`${(metrics.hist_var * 100).toFixed(2)}%`} change="1D" />
          <KpiCard label="Hist CVaR" value={`${(metrics.hist_cvar * 100).toFixed(2)}%`} change="1D" />
          <KpiCard label="Param VaR" value={`${(metrics.param_var * 100).toFixed(2)}%`} change="1D" />
          <KpiCard label="Param CVaR" value={`${(metrics.param_cvar * 100).toFixed(2)}%`} change="1D" />
        </section>
      ) : null}

      {metrics ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <LineChartCard
            title="Rolling Volatility"
            subtitle="63-day window"
            data={metrics.rolling_vol.dates.map((date, index) => ({
              date,
              value: metrics.rolling_vol.values[index]
            }))}
            color="#64748B"
            valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
          />
          <LineChartCard
            title="Rolling Sharpe"
            subtitle="63-day window"
            data={metrics.rolling_sharpe.dates.map((date, index) => ({
              date,
              value: metrics.rolling_sharpe.values[index]
            }))}
            color="#0F766E"
          />
        </section>
      ) : null}

      {factors ? (
        <Panel title="Factor Exposures" subtitle={`Fama-French (R² ${factors.r2.toFixed(2)})`}>
          <div className="space-y-2 text-sm">
            {factorRows.map((row) => (
              <div key={row.name} className="flex items-center justify-between">
                <span className="text-muted">{row.name}</span>
                <span className="font-semibold text-ink">
                  {row.value.toFixed(3)} (t={row.tstat.toFixed(2)})
                </span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
