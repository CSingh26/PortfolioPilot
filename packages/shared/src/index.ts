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

export const RiskRequestSchema = z.object({
  tickers: z.array(z.string().regex(/^[A-Z0-9^][A-Z0-9.^=-]{0,14}$/)).min(1).max(25),
  start: z.string(),
  end: z.string(),
  alpha: z.number().gt(0.5).lt(1).default(0.95),
  weights: z.record(z.number().finite().min(0).max(1)).optional(),
  benchmark: z.string().optional(),
  risk_free: z.number().finite().gt(-1).max(1).optional(),
  history: z.object({
    dates: z.array(z.string()).min(3).max(10000),
    prices: z.record(z.array(z.number().finite().positive())),
    source: z.string().min(1).max(200)
  }).optional(),
  shocks: z.record(z.number().finite().min(-1).max(10)).optional()
});

export const RiskMetricsSchema = z.object({
  hist_var: z.number(), hist_cvar: z.number(), param_var: z.number(), param_cvar: z.number(),
  volatility: z.number(), rolling_vol: TimeSeriesSchema, rolling_sharpe: TimeSeriesSchema,
  expected_return: z.number(), excess_return: z.number(), cagr: z.number(),
  sharpe: z.number().nullable(), sortino: z.number().nullable(),
  downside_deviation: z.number(), max_drawdown: z.number(), beta: z.number().nullable(),
  capm_return: z.number().nullable(), alpha: z.number().nullable(), benchmark_return: z.number(),
  diversification_ratio: z.number().nullable(), risk_contribution: z.record(z.number()),
  asset_metrics: z.record(z.record(z.number().nullable())),
  covariance: z.record(z.record(z.number())), correlation: z.record(z.record(z.number().nullable())),
  stress_return: z.number(), returns: TimeSeriesSchema, equity_curve: TimeSeriesSchema,
  drawdown: TimeSeriesSchema,
  metadata: z.object({
    source: z.string(), observations: z.number(), price_observations: z.number(),
    start: z.string(), end: z.string(), frequency: z.string(), periods_per_year: z.number(),
    confidence: z.number(), benchmark: z.string(), risk_free_annual_effective: z.number(),
    input_sha256: z.string(), assumptions: z.string(), warnings: z.array(z.string())
  })
});

export const FactorRegressionRequestSchema = z.object({
  tickers: z.array(z.string()),
  start: z.string(),
  end: z.string()
});

export const FactorRegressionResultSchema = z.object({
  coefficients: z.record(z.number()),
  tstats: z.record(z.number()),
  r2: z.number()
});

export type BacktestRequest = z.infer<typeof BacktestRequestSchema>;
export type BacktestResult = z.infer<typeof BacktestResultSchema>;
export type OptimizationRequest = z.infer<typeof OptimizationRequestSchema>;
export type OptimizationResult = z.infer<typeof OptimizationResultSchema>;
export type RunRecord = z.infer<typeof RunRecordSchema>;
export type RiskRequest = z.infer<typeof RiskRequestSchema>;
export type RiskMetrics = z.infer<typeof RiskMetricsSchema>;
export type FactorRegressionRequest = z.infer<typeof FactorRegressionRequestSchema>;
export type FactorRegressionResult = z.infer<typeof FactorRegressionResultSchema>;
