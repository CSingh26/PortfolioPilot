# Architecture

```text
Next.js workbench: source/weights/shocks → Zod shared boundary
                       ↓ HTTP
Express gateway: bounded JSON / time-limited quant proxy
                       ↓ HTTP
FastAPI: Pydantic request validation → complete adjusted-price panel
                       ↓
Pure pandas/NumPy risk estimators / CVXPY allocation / holdings backtest
                       ↓
Typed response → interpretations / charts / provenance / JSON export

Yahoo → normalized OHLCV → local parquet cache
Finnhub → Redis → optional observed quote monitor
Prisma/PostgreSQL + local run JSON → saved-run history
```

## Boundaries
`services/quant/app/models.py` owns financial input validation. `data/panel.py` validates common
panels without imputation. `analytics/laboratory.py` is the descriptive risk service; formulas
are centralized outside React. `backtest/engine.py` is separate holdings accounting and only
uses history available at a decision date. `optimize/` contains solver-backed research estimators.
`packages/shared/` validates TypeScript boundaries and response shape. The API never synthesizes
financial values. The risk view can operate from user-provided CSV without external provider calls.

## Errors and operational scope
Invalid finance inputs, unavailable/partial panels and infeasible optimizations return 422.
Malformed JSON is rejected by framework parsers; the gateway body limit is 2 MB and quant proxy
has a 120-second timeout. Direct quant exposure bypasses the gateway body limit: keep both services
on trusted local interfaces. External transport failures are unavailable responses, not demo fallbacks.
The live page displays feed/quote timestamps and unavailable status rather than invented prices.

No authentication/authorization is implemented. This is a local research tool, not a multi-tenant
production trading system. Saving runs requires PostgreSQL; quote monitoring and the current gateway
startup require Redis. The core FastAPI risk endpoint can be used directly without either service.
Provider failures, JSON artifacts and caches should be handled as research data, not an audited ledger.

## Reproducibility and verification
Node dependencies use a frozen pnpm lockfile, Python 3.12 dependencies an exact requirements lock.
CI executes installs, Node/Python lint, TypeScript checks, domain/UI tests, dependency audit and
production build. SHA-256 identifies normalized risk input prices; request weights, confidence,
risk-free assumption and benchmark remain separate model inputs. For exact reproduction preserve
the request alongside the exported response. Model formulas and limits are versioned in Git.
