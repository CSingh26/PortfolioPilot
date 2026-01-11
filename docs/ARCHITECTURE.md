# PortfolioPilot Architecture

## Overview
PortfolioPilot is a monorepo with three runtime services and a shared schema package. The system is designed for clear separation of concerns: the web dashboard focuses on presentation, the API gateway coordinates persistence and streaming data, and the quant service focuses on research-grade analytics.

## Monorepo Layout
- `apps/web` - Next.js dashboard (App Router, Tailwind, Recharts)
- `services/api` - Express API gateway + Prisma + Redis + Finnhub consumer
- `services/quant` - FastAPI quant engine (backtests, optimizers, risk)
- `packages/shared` - Zod schemas + shared TS types
- `docs` - Architecture, math, API references, model card
- `infra` - Docker Compose and infra helpers
- `scripts` - Dev helpers
- `data` - Local cache and run artifacts

## Data Flow
1. **Live prices**
   - API service connects to Finnhub WebSocket and stores quotes in Redis.
   - API exposes `GET /v1/live/quotes` for the dashboard.

2. **Historical data**
   - Quant service downloads OHLCV from yfinance.
   - Data is cached locally in Parquet (`data/cache`) for reuse.

3. **Backtests and optimization**
   - Web submits requests to the API proxy endpoints.
   - API forwards to the quant service and returns results to the dashboard.
   - Web can store a run using `POST /v1/runs` (results persisted in DB + `data/runs`).

4. **Risk analytics**
   - Quant service computes VaR/CVaR, rolling stats, and factor regression.
   - Web consumes these metrics for risk dashboards.

## Persistence
- **Postgres** is the default database for run metadata.
- **SQLite** is supported for local fallback via a separate Prisma schema.
- **Redis** stores live quotes and health metadata.

## Key Design Choices
- **Separation of execution and analytics**: the quant engine can evolve independently of the API gateway.
- **Local caching**: historical data and backtest outputs are cached to reduce repeated data pulls.
- **Schema sharing**: shared Zod schemas keep the API and web aligned.

## Deployment
- Docker Compose wires together `web`, `api`, `quant`, `postgres`, and `redis`.
- GitHub Actions runs lint, typecheck, tests, and builds on each push.
