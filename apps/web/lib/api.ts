import {
  BacktestRequest,
  BacktestRequestSchema,
  BacktestResult,
  BacktestResultSchema,
  FactorRegressionRequest,
  FactorRegressionRequestSchema,
  FactorRegressionResult,
  FactorRegressionResultSchema,
  OptimizationRequest,
  OptimizationRequestSchema,
  OptimizationResult,
  OptimizationResultSchema,
  RunRecord,
  RunRecordSchema,
  RiskMetrics,
  RiskMetricsSchema,
  RiskRequest,
  RiskRequestSchema
} from '@portfoliopilot/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function handleResponse<T>(response: Response, schema: { parse: (data: unknown) => T }) {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = await response.json();
  return schema.parse(data);
}

export async function runBacktest(request: BacktestRequest): Promise<BacktestResult> {
  const payload = BacktestRequestSchema.parse(request);
  const response = await fetch(`${API_URL}/v1/quant/backtest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response, BacktestResultSchema);
}

export async function saveRun(payload: {
  name?: string;
  strategy: string;
  config: unknown;
  summary?: unknown;
  results?: unknown;
}): Promise<RunRecord> {
  const response = await fetch(`${API_URL}/v1/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response, RunRecordSchema);
}

export async function listRuns(): Promise<RunRecord[]> {
  const response = await fetch(`${API_URL}/v1/runs`);
  if (!response.ok) {
    throw new Error('Failed to fetch runs');
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map((item) => RunRecordSchema.parse(item)) : [];
}

export async function runOptimization(request: OptimizationRequest): Promise<OptimizationResult> {
  const payload = OptimizationRequestSchema.parse(request);
  const response = await fetch(`${API_URL}/v1/quant/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response, OptimizationResultSchema);
}

export async function getRiskMetrics(request: RiskRequest): Promise<RiskMetrics> {
  const payload = RiskRequestSchema.parse(request);
  const response = await fetch(`${API_URL}/v1/quant/risk/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response, RiskMetricsSchema);
}

export async function getFactorRegression(
  request: FactorRegressionRequest
): Promise<FactorRegressionResult> {
  const payload = FactorRegressionRequestSchema.parse(request);
  const response = await fetch(`${API_URL}/v1/quant/risk/factors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response, FactorRegressionResultSchema);
}
