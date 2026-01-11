# PortfolioPilot Model Card

## Summary
PortfolioPilot is a portfolio analytics stack that combines classical quantitative finance methods with reproducible backtests. It does not train a predictive model; instead it implements deterministic optimizers and statistical estimators for allocation and risk.

## Intended Use
- Portfolio construction and allocation research
- Backtesting systematic strategies
- Risk diagnostics and factor attribution

## Data Sources
- **Finnhub**: real-time quotes (WebSocket)
- **Yahoo Finance (yfinance)**: historical OHLCV
- **FRED**: risk-free rate (optional)
- **Ken French Library**: daily factor data

## Methods
- Mean-Variance Optimization (MVO)
- Risk Parity
- CVaR minimization
- EWMA volatility targeting
- Historical + parametric VaR/CVaR
- Factor regression on Fama-French factors

## Assumptions
- Returns are computed from adjusted close prices.
- Transaction costs and slippage are modeled in bps at rebalance.
- Long-only constraints are enforced for constrained optimizers.

## Limitations
- No corporate action adjustments beyond what yfinance provides.
- No explicit transaction cost model beyond linear bps.
- Factor regression assumes linear OLS with stable betas.

## Ethics and Compliance
This tool is for educational and research use. It does not constitute investment advice.
