'use client';

import { useEffect, useMemo, useState } from 'react';
import Panel from '../Panel';
import { getLiveQuotes, type LiveQuote } from '../../lib/api';

const defaultSymbols = ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM', 'AGG', 'GLD', 'VNQ', 'TLT', 'LQD'];

export default function LiveMarketClient() {
  const [quotes, setQuotes] = useState<LiveQuote[]>([]);
  const [mode, setMode] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [basePrices, setBasePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await getLiveQuotes(defaultSymbols);
        if (!active) return;
        setQuotes(response.quotes);
        setMode(response.mode);
        setLastUpdated(response.lastUpdated);
        setBasePrices((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          const snapshot: Record<string, number> = {};
          response.quotes.forEach((quote) => {
            snapshot[quote.symbol] = quote.price;
          });
          return snapshot;
        });
      } catch {
        // ignore polling errors
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const pnl = useMemo(() => {
    if (quotes.length === 0) return 0;
    const returns = quotes.map((quote) => {
      const base = basePrices[quote.symbol] ?? quote.price;
      return (quote.price - base) / base;
    });
    return returns.reduce((acc, val) => acc + val, 0) / returns.length;
  }, [quotes, basePrices]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="Quotes" subtitle="Live Tickers">
          <div className="space-y-3 text-sm">
            {quotes.length === 0 ? (
              <p className="text-muted">Waiting for quotes…</p>
            ) : (
              quotes.map((quote) => (
                <div key={quote.symbol} className="flex items-center justify-between">
                  <span className="text-muted">{quote.symbol}</span>
                  <span className="font-semibold text-ink">{quote.price.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </Panel>
        <Panel title="Paper PnL" subtitle="Equal-Weight Basket">
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Aggregate PnL</span>
              <span className="font-semibold text-ink">{(pnl * 100).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tracking</span>
              <span className="font-semibold text-ink">{quotes.length} symbols</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mode</span>
              <span className="font-semibold text-ink">{mode ?? '—'}</span>
            </div>
          </div>
        </Panel>
        <Panel title="Latency" subtitle="Feed Health">
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-semibold text-ink">{mode ? 'Connected' : 'Idle'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last tick</span>
              <span className="font-semibold text-ink">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
              </span>
            </div>
          </div>
        </Panel>
      </section>

      <Panel title="Market Tape" subtitle="Latest Updates">
        <div className="space-y-2 text-sm">
          {quotes.slice(0, 6).map((quote) => (
            <div key={quote.symbol} className="flex items-center justify-between">
              <span className="text-muted">{quote.symbol}</span>
              <span className="font-semibold text-ink">
                {quote.price.toFixed(2)}
                <span className="ml-2 text-xs text-muted">
                  {new Date(quote.timestamp).toLocaleTimeString()}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
