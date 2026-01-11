'use client';

import { useMemo, useState } from 'react';
import type { OptimizationRequest, OptimizationResult } from '@portfoliopilot/shared';
import Panel from '../Panel';
import FrontierChartCard from '../charts/FrontierChartCard';
import { runOptimization } from '../../lib/api';

const defaultRequest: OptimizationRequest = {
  tickers: ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM'],
  start: '2019-01-01',
  end: '2024-12-31',
  method: 'mvo',
  target_return: undefined,
  max_weight: 0.35,
  risk_free: 0.03,
  alpha: 0.95,
  frontier_points: 25,
  long_only: true
};

const methods = [
  { value: 'mvo', label: 'Mean-Variance' },
  { value: 'risk_parity', label: 'Risk Parity' },
  { value: 'cvar', label: 'CVaR Min' }
] as const;

export default function OptimizerLabClient() {
  const [form, setForm] = useState<OptimizationRequest>(defaultRequest);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'running'>('idle');
  const [error, setError] = useState<string | null>(null);

  const weightRows = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.weights)
      .map(([symbol, weight]) => ({ symbol, weight }))
      .sort((a, b) => b.weight - a.weight);
  }, [result]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('running');
    setError(null);
    try {
      const response = await runOptimization(form);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className="space-y-6">
      <Panel title="Objective" subtitle="Optimization Inputs">
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
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Method</label>
            <select
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.method}
              onChange={(event) =>
                setForm({ ...form, method: event.target.value as OptimizationRequest['method'] })
              }
            >
              {methods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Target Return</label>
            <input
              type="number"
              step="0.01"
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.target_return ?? ''}
              onChange={(event) =>
                setForm({
                  ...form,
                  target_return: event.target.value ? Number(event.target.value) : undefined
                })
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Max Weight</label>
            <input
              type="number"
              step="0.05"
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.max_weight ?? ''}
              onChange={(event) =>
                setForm({
                  ...form,
                  max_weight: event.target.value ? Number(event.target.value) : undefined
                })
              }
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
              disabled={status === 'running'}
            >
              {status === 'running' ? 'Optimizing…' : 'Run Optimizer'}
            </button>
          </div>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
      </Panel>

      {result?.frontier ? (
        <FrontierChartCard title="Frontier" subtitle="Efficient Frontier" data={result.frontier} />
      ) : null}

      {result ? (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Weights" subtitle="Optimized Allocation">
            <div className="space-y-2 text-sm">
              {weightRows.map((row) => (
                <div key={row.symbol} className="flex items-center justify-between">
                  <span className="text-muted">{row.symbol}</span>
                  <span className="font-semibold text-ink">{(row.weight * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Portfolio" subtitle="Expected Metrics">
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-center justify-between">
                <span>Expected Return</span>
                <span className="font-semibold text-ink">
                  {(result.expected_return * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Expected Vol</span>
                <span className="font-semibold text-ink">
                  {(result.expected_vol * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sharpe</span>
                <span className="font-semibold text-ink">{result.sharpe.toFixed(2)}</span>
              </div>
            </div>
          </Panel>
        </section>
      ) : null}
    </div>
  );
}
