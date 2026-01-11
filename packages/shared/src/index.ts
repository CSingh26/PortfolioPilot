import { z } from 'zod';

export const StrategySchema = z.enum([
  'buy_and_hold',
  'equal_weight',
  'momentum_12_1',
  'min_variance',
  'risk_parity',
  'vol_target',
  'cvar_min'
]);

export const TimeSeriesSchema = z.object({
  dates: z.array(z.string()),
  values: z.array(z.number())
});

export const WeightSeriesSchema = z.object({
  dates: z.array(z.string()),
  weights: z.record(z.array(z.number()))
});

export const RunSummarySchema = z.object({
  cagr: z.number(),
  vol: z.number(),
  sharpe: z.number(),
  max_drawdown: z.number(),
  calmar: z.number()
});

export const BacktestRequestSchema = z.object({
  tickers: z.array(z.string()).default([]),
  start: z.string(),
  end: z.string(),
  strategy: StrategySchema,
  rebalance: z.string().default('M'),
  transaction_cost_bps: z.number().default(5),
  slippage_bps: z.number().default(2),
  benchmark: z.string().default('SPY'),
  risk_free: z.number().optional(),
  lookback_window: z.number().default(126),
  max_weight: z.number().optional(),
  vol_target: z.number().optional()
});

export const BacktestResultSchema = z.object({
  run_id: z.string(),
  summary: RunSummarySchema,
  equity_curve: TimeSeriesSchema,
  returns: TimeSeriesSchema,
  drawdown: TimeSeriesSchema,
  weights: WeightSeriesSchema,
  turnover: TimeSeriesSchema,
  costs: TimeSeriesSchema
});

export const OptimizationRequestSchema = z.object({
  tickers: z.array(z.string()),
  start: z.string(),
  end: z.string(),
  method: z.enum(['mvo', 'risk_parity', 'cvar']),
  target_return: z.number().optional(),
  max_weight: z.number().optional(),
  risk_free: z.number().optional(),
  alpha: z.number().default(0.95),
  frontier_points: z.number().default(25),
  long_only: z.boolean().default(true)
});

export const FrontierPointSchema = z.object({
  expected_return: z.number(),
  expected_vol: z.number()
});

export const OptimizationResultSchema = z.object({
  weights: z.record(z.number()),
  expected_return: z.number(),
  expected_vol: z.number(),
  sharpe: z.number(),
  frontier: z.array(FrontierPointSchema).nullable()
});

export const RunRecordSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  name: z.string().nullable(),
  strategy: z.string(),
  config: z.unknown(),
  summary: z.unknown().nullable(),
  resultsPath: z.string().nullable()
});

export type BacktestRequest = z.infer<typeof BacktestRequestSchema>;
export type BacktestResult = z.infer<typeof BacktestResultSchema>;
export type OptimizationRequest = z.infer<typeof OptimizationRequestSchema>;
export type OptimizationResult = z.infer<typeof OptimizationResultSchema>;
export type RunRecord = z.infer<typeof RunRecordSchema>;
