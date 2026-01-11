'use client';

import { useMemo, useState } from 'react';
import type { BacktestRequest, BacktestResult } from '@portfoliopilot/shared';
import KpiCard from '../KpiCard';
import LineChartCard from '../charts/LineChartCard';
import AreaChartCard from '../charts/AreaChartCard';
import StackedAreaChartCard from '../charts/StackedAreaChartCard';
import MonthlyHeatmap from '../charts/MonthlyHeatmap';
import Panel from '../Panel';
import { monthlyHeatmap, rollingSharpe, rollingVol, weightsToStackedData } from '../../lib/analytics';
import { runBacktest, saveRun } from '../../lib/api';

const defaultRequest: BacktestRequest = {
  tickers: ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM'],
  start: '2019-01-01',
  end: '2024-12-31',
  strategy: 'risk_parity',
  rebalance: 'M',
  transaction_cost_bps: 5,
  slippage_bps: 2,
  benchmark: 'SPY',
  risk_free: 0.03,
  lookback_window: 126,
  max_weight: 0.35,
  vol_target: undefined
};

const strategies = [
  { value: 'buy_and_hold', label: 'Buy & Hold' },
  { value: 'equal_weight', label: 'Equal Weight' },
  { value: 'momentum_12_1', label: 'Momentum 12-1' },
  { value: 'min_variance', label: 'Min Variance' },
  { value: 'risk_parity', label: 'Risk Parity' },
  { value: 'vol_target', label: 'Vol Target' },
  { value: 'cvar_min', label: 'CVaR Min' }
] as const;

export default function BacktestLabClient() {
  const [form, setForm] = useState<BacktestRequest>(defaultRequest);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  const equitySeries = useMemo(() => {
    if (!result) return [];
    return result.equity_curve.dates.map((date, index) => ({
      date,
      value: result.equity_curve.values[index]
    }));
  }, [result]);

  const drawdownSeries = useMemo(() => {
    if (!result) return [];
    return result.drawdown.dates.map((date, index) => ({
      date,
      value: result.drawdown.values[index]
    }));
  }, [result]);

  const returnSeries = useMemo(() => {
    if (!result) return [];
    return result.returns.dates.map((date, index) => ({
      date,
      value: result.returns.values[index]
    }));
  }, [result]);

  const rollingSharpeSeries = useMemo(() => rollingSharpe(returnSeries), [returnSeries]);
  const rollingVolSeries = useMemo(() => rollingVol(returnSeries), [returnSeries]);

  const heatmapRows = useMemo(() => monthlyHeatmap(returnSeries), [returnSeries]);

  const allocationData = useMemo(() => {
    if (!result) return [];
    const latestWeights = Object.entries(result.weights.weights)
      .map(([symbol, values]) => ({ symbol, value: values[values.length - 1] ?? 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((entry) => entry.symbol);
    const filteredWeights: Record<string, number[]> = {};
    latestWeights.forEach((symbol) => {
      filteredWeights[symbol] = result.weights.weights[symbol];
    });
    return weightsToStackedData(result.weights.dates, filteredWeights);
  }, [result]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('running');
    setError(null);
    try {
      const payload: BacktestRequest = {
        ...form,
        tickers: form.tickers
      };
      const response = await runBacktest(payload);
      setResult(response);
      await saveRun({
        name: `Backtest ${new Date().toISOString().slice(0, 10)}`,
        strategy: payload.strategy,
        config: payload,
        summary: response.summary,
        results: response
      });
      setStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run backtest');
      setStatus('idle');
    }
  }

  return (
    <div className="space-y-6">
      <Panel title="Strategy" subtitle="Configure Backtest">
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
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Strategy</label>
            <select
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.strategy}
              onChange={(event) =>
                setForm({ ...form, strategy: event.target.value as BacktestRequest['strategy'] })
              }
            >
              {strategies.map((strategy) => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Rebalance</label>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.rebalance}
              onChange={(event) => setForm({ ...form, rebalance: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Costs (bps)</label>
            <input
              type="number"
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.transaction_cost_bps}
              onChange={(event) =>
                setForm({ ...form, transaction_cost_bps: Number(event.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Slippage (bps)</label>
            <input
              type="number"
              className="mt-2 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm"
              value={form.slippage_bps}
              onChange={(event) => setForm({ ...form, slippage_bps: Number(event.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
              disabled={status === 'running'}
            >
              {status === 'running' ? 'Running…' : 'Run Backtest'}
            </button>
          </div>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
        {status === 'saved' ? (
          <p className="mt-4 text-sm text-emerald-700">Run saved to history.</p>
        ) : null}
      </Panel>

      {result ? (
        <section className="grid gap-4 lg:grid-cols-4">
          <KpiCard label="CAGR" value={`${(result.summary.cagr * 100).toFixed(2)}%`} change="Annualized" />
          <KpiCard
            label="Volatility"
            value={`${(result.summary.vol * 100).toFixed(2)}%`}
            change="Annualized"
          />
          <KpiCard label="Sharpe" value={result.summary.sharpe.toFixed(2)} change="Rolling" />
          <KpiCard
            label="Max Drawdown"
            value={`${(result.summary.max_drawdown * 100).toFixed(2)}%`}
            change="Peak-to-trough"
          />
        </section>
      ) : null}

      {result ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <LineChartCard
            title="Performance"
            subtitle="Equity Curve"
            data={equitySeries}
            valueFormatter={(value) => value.toFixed(2)}
          />
          <AreaChartCard
            title="Drawdown"
            subtitle="Peak-to-trough"
            data={drawdownSeries}
            color="#0F766E"
            valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
          />
        </section>
      ) : null}

      {result ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <LineChartCard
            title="Rolling Sharpe"
            subtitle="63-day window"
            data={rollingSharpeSeries}
            color="#0F766E"
          />
          <LineChartCard
            title="Rolling Volatility"
            subtitle="63-day window"
            data={rollingVolSeries}
            color="#64748B"
            valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
          />
        </section>
      ) : null}

      {result ? (
        <StackedAreaChartCard
          title="Allocation"
          subtitle="Top weights over time"
          data={allocationData}
          keys={Object.keys(allocationData[0] ?? {}).filter((key) => key !== 'date')}
        />
      ) : null}

      {result ? <MonthlyHeatmap title="Monthly Returns" subtitle="Return heatmap" rows={heatmapRows} /> : null}
    </div>
  );
}
