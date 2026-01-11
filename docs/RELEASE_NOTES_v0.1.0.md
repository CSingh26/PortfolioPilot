# PortfolioPilot v0.1.0

## Highlights
- Full quant lab: backtesting, optimizer, and risk analytics dashboards
- Live market page with Finnhub WebSocket + Redis cache
- Quant engine with MVO, risk parity, CVaR, and EWMA volatility targeting
- Fama-French factor regression and VaR/CVaR analytics
- Docker Compose stack and CI workflow

## Getting Started
1. `pnpm i`
2. `docker compose -f infra/docker-compose.yml up -d` (optional)
3. `python3 -m pip install -e "services/quant[dev]"`
4. `cd services/quant && python3 -m uvicorn app.main:app --reload --port 8000`
5. `pnpm dev`
6. `pnpm seed` (optional sample runs)
