import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePriceCsv, teachingFixture } from '../lib/price-input';
import { RiskRequestSchema } from '../../../packages/shared/src';

test('CSV preserves decimal prices and provenance', () => {
  const result = parsePriceCsv('date,A\n2024-01-01,100\n2024-01-02,101.5\n2024-01-03,98', 'own data');
  assert.deepEqual(result.prices.A, [100, 101.5, 98]);
  assert.equal(result.source, 'own data');
});
test('CSV rejects incomplete, duplicate or nonpositive prices', () => {
  for (const csv of ['date,A\n2024-01-01,100\n2024-01-02,\n2024-01-03,98',
    'date,A,A\n2024-01-01,1,2\n2024-01-02,1,2\n2024-01-03,1,2']) {
    assert.throws(() => parsePriceCsv(csv, 'test'));
  }
});
test('teaching fixture is reproducible and never labeled as observed market data', () => {
  assert.equal(teachingFixture(), teachingFixture());
  const data = parsePriceCsv(teachingFixture(), 'SYNTHETIC TEACHING DATA');
  assert.equal(data.dates.length, 300);
  assert.deepEqual(Object.keys(data.prices), ['EQUITY', 'BONDS', 'GOLD']);
});
test('shared request boundary rejects invalid tail confidence and nonfinite allocations', () => {
  const base = { tickers: ['A'], start: '2024-01-01', end: '2024-12-31' };
  assert.equal(RiskRequestSchema.safeParse({ ...base, alpha: 1 }).success, false);
  assert.equal(RiskRequestSchema.safeParse({ ...base, weights: { A: Infinity } }).success, false);
});

test('backtest summaries preserve unavailable ratios instead of converting them to zero', async () => {
  const { RunSummarySchema } = await import('../../../packages/shared/src');
  const result = RunSummarySchema.parse({ cagr: 0, vol: 0, sharpe: null, max_drawdown: 0, calmar: null });
  assert.equal(result.sharpe, null);
  assert.equal(result.calmar, null);
});
