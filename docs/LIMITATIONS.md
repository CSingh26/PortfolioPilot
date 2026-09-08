# Limitations and model risks

- Historical adjusted data may be revised; neither Yahoo nor supplied CSV is proven point-in-time.
  The source label is an assertion and the input hash identifies content, not its truth.
- A fixed user-selected universe can contain survivorship/selection bias. Missing instruments are
  rejected, not silently removed. No exchange-calendar reconciliation is available.
- 252-day annualization and coarse date-spacing checks do not establish independent returns.
  Autocorrelation, regimes, fat tails and small samples undermine simple estimates.
- Risk snapshots are daily constant-weight descriptions without costs. They must not be presented
  as buy-and-hold or executable strategy performance. Risk workbench ratios are null when undefined.
- CAPM and factor exposures are historical linear relationships. No causal interpretation or
  statistically significant alpha is claimed. OLS inference does not use robust standard errors.
- MVO uses noisy sample means/covariance. Risk parity rejects singular covariance. CVaR and the
  frontier are in-sample estimates; no completed walk-forward evaluation or profitable result is claimed.
- Backtest close-based signals assume close execution; exact fills, tax, impact, financing,
  borrow availability and cost/target fixed-point calculations are not modeled. Warm-up cash has
  zero yield; leverage is excluded from the backtest. This differs from unconstrained optimizer outputs.
- The backtest compatibility benchmark is not used in calculations; each response/UI explicitly
  warns about this scope. Actual benchmark comparisons are in the risk workbench. Undefined
  Sharpe/Calmar values are null and displayed as unavailable, not numerical zero.
- Static shocks are linear, with no probability or derivatives repricing. Correlations during stress
  need not match historical correlations.
- Saved-run persistence needs PostgreSQL and local files; quote monitor/gateway needs Redis.
  Live timestamps indicate observed quote freshness, not measured exchange latency.
- The research API has no authentication, authorization, user isolation or production rate limits.
  Local/trusted use only. No brokerage integration, order execution or investment advice is provided.
