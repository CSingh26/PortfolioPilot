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

## Supplied-price risk request (no provider credentials)

```bash
curl http://localhost:8000/v1/risk/metrics \
  -H 'Content-Type: application/json' \
  -d '{"tickers":["A","B"],"start":"2024-01-01","end":"2024-01-09","benchmark":"A","weights":{"A":0.5,"B":0.5},"risk_free":0,"alpha":0.8,"shocks":{"A":-0.2,"B":0.1},"history":{"dates":["2024-01-01","2024-01-02","2024-01-03","2024-01-04","2024-01-05","2024-01-08"],"prices":{"A":[100,110,99,99,108.9,98.01],"B":[100,100,100,100,100,100]},"source":"Hand-calculation teaching fixture; not market data"}}'
```

This deliberately tiny teaching panel gives beta .5, 79.3725% annualized volatility and a −5%
linear stress return. Its large annualized volatility and sparse tail sample are educational,
not market estimates. The response carries explicit short-sample warnings.

The rich response includes annual return/risk estimates, signed one-day tail returns,
correlation/covariance, benchmark CAPM, risk contributions, rolling curves and provenance.
Invalid input or incomplete prices return 422. Source metadata is user/provider provenance,
not independent verification. Risk export identifies the price panel by hash; retain the
request/CSV to reproduce it. The date range is start-inclusive and end-exclusive.
