# PortfolioPilot API Reference

## API Gateway (`services/api`)
Base URL: `http://localhost:4000`

### Health
- `GET /v1/health`

### Live Quotes
- `GET /v1/live/quotes?symbols=SPY,QQQ`
  - Response: `{ symbols, mode, lastUpdated, quotes[] }`

### Runs
- `GET /v1/runs`
- `GET /v1/runs/:id`
- `GET /v1/runs/:id/export`
- `POST /v1/runs`
  - Body: `{ name?, strategy, config, summary?, results? }`

### Quant Proxy
- `POST /v1/quant/backtest`
- `POST /v1/quant/optimize`
- `POST /v1/quant/risk/metrics`
- `POST /v1/quant/risk/factors`

## Quant Engine (`services/quant`)
Base URL: `http://localhost:8000`

### Health
- `GET /v1/health`

### Backtest
- `POST /v1/backtest`
  - Body: `BacktestRequest`
  - Response: `BacktestResult`

### Optimization
- `POST /v1/optimize`
  - Body: `OptimizationRequest`
  - Response: `OptimizationResult`

### Risk
- `POST /v1/risk/metrics`
  - Body: `RiskRequest`
  - Response: `RiskMetrics`
- `POST /v1/risk/factors`
  - Body: `FactorRegressionRequest`
  - Response: `FactorRegressionResult`

## Shared Schemas
See `packages/shared/src/index.ts` for Zod schemas used by the web and API.
