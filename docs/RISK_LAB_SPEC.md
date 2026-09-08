# PortfolioPilot risk laboratory specification

## Financial decision and scope
Investigate whether an allocation diversifies economic risk, which holdings drive volatility,
and what historical downside and hypothetical shocks imply. Preserve the existing Next.js,
Express, FastAPI, optimizer and saved-run architecture. Extend the risk workflow rather than
add a disconnected demo. The project lead covers finance, quant, data, engineering, UI and
release; independent review is coordinated outside this repository.

## Design
- Strict daily adjusted-price panel, either supplied by the user or retrieved from Yahoo.
  No missing-data substitution, forward filling, invented observations or zero-risk fallbacks.
  Return input hash, source, date range, frequency, observation count and assumptions.
- Fully invested long-only user weights (equal weights by default). Risk snapshot assumes
  daily rebalancing before costs; it is descriptive, not an executable backtest.
- Arithmetic expected/excess return, geometric CAGR, annual sample volatility, downside
  deviation, Sharpe/Sortino, drawdown including initial capital, signed 1-day VaR/CVaR,
  benchmark beta/CAPM/alpha, covariance/correlation, Euler volatility contributions,
  diversification ratio, rolling metrics and user-specified linear asset shocks.
- Undefined ratios are null with explanations, not zero or infinity. In-sample estimates
  are clearly distinguished from forecasts and out-of-sample strategy evidence.
- Correct backtest drift, initial deployment cost, period-end scheduling, warm-up and
  lagged volatility targeting; account for turnover after leverage/weight changes.
- Optimizers must reject infeasibility instead of returning apparently optimized equal weights.
- Replace fictional home metrics with an actual research workflow; risk page supports CSV
  inputs and a deliberately labeled deterministic teaching fixture, never provider fallback.

## Incremental implementation and acceptance
1. Commit this specification; establish local dependencies and baseline checks.
2. Write failing domain/data/API tests; implement validated panel and rich risk analytics.
3. Add backtest temporal/cost and optimizer regression tests, then correct their engines.
4. Integrate typed API/UI interpretations, upload, stress exploration and honest landing page.
5. Financial methods, data contract, limitations, reproducible dependencies and CI checks.
6. Run full lint/types/tests/build, capture actual UI, request independent review, fix findings,
   publish default-branch commits and verify exact remote SHA/CI before delivery evidence.

## Explicit limitations
Historical adjusted prices may be revised, the selected universe has survivorship bias,
252-day annualization assumes trading-day observations, normal-tail metrics ignore fat tails,
CAPM is descriptive and unstable, static stress is linear without liquidity/option effects.
No investment recommendation, claim of live data, or profitable strategy is implied.
