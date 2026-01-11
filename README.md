# PortfolioPilot

PortfolioPilot is a quant portfolio optimizer and backtesting lab with a professional analytics dashboard. It combines real market data, robust optimizers, and a live monitoring workspace built for institutional-style workflows.

## Highlights
- Mean-variance optimization, risk parity, CVaR, and volatility targeting
- Vectorized backtesting engine with costs, turnover, and rolling analytics
- Finnhub live quotes + Redis cache
- Fama-French factor regression and FRED risk-free integration
- Next.js dashboard with backtest lab, optimizer, risk, live, and run history

## Quickstart

1) Install dependencies
```
pnpm i
```

2) (Optional) Start infrastructure
```
docker compose -f infra/docker-compose.yml up -d
```

3) Start the quant engine
```
python3 -m pip install -e "services/quant[dev]"
cd services/quant
python3 -m uvicorn app.main:app --reload --port 8000
```

4) Start web + API
```
pnpm dev
```

5) Seed sample runs (optional)
```
pnpm seed
```

## Environment
Copy `.env.example` to `.env` and set keys as needed:
- `FINNHUB_API_KEY` for live quotes
- `FRED_API_KEY` for risk-free series

## Useful Commands
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `make docker-up`

## Documentation
- Architecture: `docs/ARCHITECTURE.md`
- Math derivations: `docs/MATH.md`
- API reference: `docs/API.md`
- Model card: `docs/MODEL_CARD.md`
