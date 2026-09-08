# Financial methodology

## Data and units
All input prices must be finite, strictly positive and complete across the selected assets and
benchmark. Returns are simple: `r[t] = P[t]/P[t−1] − 1`, with no forward filling. Yahoo data uses
adjusted closes, never substitutes raw closes, and is normalized from the provider's multi-index
format. The start date is inclusive and end date exclusive. Supplied dates must be unique and
ascending. Median spacing over three calendar days or any gap over seven is rejected; this is a
coarse frequency guard, not a validated exchange calendar. Users remain responsible for a daily
series and economic adjustment convention.

252 observations/year is an explicit convention. Annual sample covariance is `252·Cov(r)`
with `ddof=1`; volatility is `sqrt(252)·sample_std(r)`. Arithmetic annual expected return is
`252·mean(r)`, a historical estimator. CAGR is `(terminal wealth/initial wealth)^(252/n)−1`,
where n is the number of actual return intervals. The two measure different things.

## Portfolio risk snapshot
Weights are finite, nonnegative and sum to one within 1e−8. The snapshot assumes the same
weights on every daily return; this implicitly rebalances daily and excludes transaction costs.
It is descriptive analytics, separate from the backtest engine.

The annual effective risk-free rate is converted to daily `rf_d=(1+rf_a)^(1/252)−1`.
Excess arithmetic annual return is `252·mean(rp−rf_d)`. Sharpe divides that by annual volatility.
Downside deviation is `sqrt(252·mean(min(rp−rf_d,0)^2))`, using **all observations** in the mean,
not only the downside observations. Sortino divides annual mean excess by that deviation.
Zero denominators produce JSON null and an explanation, never infinity.

Wealth starts at one **before** the first return. Drawdown is wealth/running peak−1; maximum
drawdown is the most negative value. Omitting the initial point would hide an initial loss.

## Tails
All four risk outputs are **signed one-day return thresholds**, not positive dollar loss.
A negative value describes a loss; there is no annualization of VaR/CVaR.

- Historical VaR: NumPy linear return quantile at `1−confidence`.
- Historical CVaR: mean of observed returns at or below that threshold. This empirical tail
  mean is sensitive to ties and small sample counts; it is not fractional-mass expected shortfall.
- Gaussian VaR: `mean + sample_std·Φ⁻¹(1−confidence)`.
- Gaussian CVaR: `mean − sample_std·φ(Φ⁻¹(1−confidence))/(1−confidence)`.

Confidence must lie strictly between .5 and 1. Fewer than 20 expected tail observations produces
a warning. Gaussian estimates are particularly fragile for skewed, fat-tailed or dependent returns.

## Dependence and benchmark
Beta = `sample_cov(rp,rb)/sample_var(rb)`, on the identical complete daily panel.
CAPM return = `252·rf_d + beta·(252·mean(rb)−252·rf_d)`.
Alpha = portfolio arithmetic annual return minus that CAPM return. This is a descriptive sample
alpha, without an inference of skill or significance. Benchmark zero variance makes beta/CAPM/alpha
undefined. The Fama–French API separately runs OLS excess-return regressions; t-statistics are
conventional OLS, without heteroskedasticity/autocorrelation correction.

Correlation is sample Pearson correlation. Constant series have null correlations. Annual
covariance uses squared decimal-return units. Euler component volatility is `w_i·(Σw)_i/σp`;
components sum to total volatility and can be negative for hedges. The diversification ratio is
`sum(w_i·σ_i)/σp`; it compares weighted standalone with combined risk, and is undefined when
portfolio volatility is zero. It does not prove protection under future correlation regimes.
Rolling volatility and Sharpe use 63 observations ending at the plotted date and identical
annualization/risk-free conventions. Insufficient windows produce no points.

## Stress
Portfolio shock return is `sum(w_i·shock_i)`. Unspecified asset shocks are zero. Inputs are
hypothetical decimal price returns, not probability forecasts. Linear revaluation ignores nonlinear
instruments, liquidity, rebalancing, taxes, market impact and costs.

## Portfolio construction
MVO uses sample annual covariance and arithmetic annual expected returns. Long-only minimum
variance solves a quadratic program with budget and optional weight cap. Target-return portfolios
use **equality** to the selected return, so plotted frontier coordinates match achieved portfolios.
The frontier target interval is adjusted to feasible capped returns. The full minimum-variance
locus includes an inefficient lower branch; only the upper branch is economically efficient.

Positive-excess tangency portfolios use a convex transformation: minimize `yᵀΣy` subject to
`(mu−rf)ᵀy=1`, `y>=0`; normalize y. A cap is `y_i<=cap·sum(y)`. Unconstrained tangency uses inverse
covariance/pseudoinverse, rejects nonpositive normalization rather than reversing the direction.
Unconstrained MVO may use short positions; it is an analytical allocation, without leverage/cost limits.
Risk parity solves the convex log-budgeting objective and verifies equal variance contributions.
It requires positive-definite covariance and does not accept weight caps. CVaR minimizes the
Rockafellar–Uryasev empirical loss objective with long-only budget and optional caps. Solver failure
or infeasibility raises an error rather than substituting equal weights.

## Backtesting and implementation assumptions
The engine maintains fractions of wealth in assets; weights drift with price returns between
rebalance dates. Buy-and-hold trades once. Periodic strategies rebalance at the final observed
trading date in each M/W/Q period. No terminal trade is charged.

At each close, the engine first realizes returns using the preceding close's holdings, then computes
any new allocation using history through that close. New weights affect the next interval only.
This assumes execution at the same signal close, a simplified research convention that does not
model auction latency. Optimized strategies stay in zero-yield cash for the lookback window;
momentum needs 253 prices and ranks `P[t−21]/P[t−252]−1`. At least one post-warm-up interval is required.
Volatility targeting uses historical sample volatility of the base allocation at a rebalance close;
it scales exposure down to the target, capped at 100%, leaving zero-yield cash. It does not leverage.

Turnover is **gross traded asset notional**, `sum(abs(target−drifted))`, not one-way half-turnover.
Entry deployment is included. Cost fraction = turnover·(transaction_bps+slippage_bps)/10000.
Net daily wealth factor is `(1+gross_return)·(1−cost_fraction)`. This is a linear approximation:
weights describe fractions after costs, without solving the exact self-financing trade/cost fixed point.
Cost series uses a fraction of post-return pre-trade wealth. Warm-up returns are part of the full
research horizon. Initial entry cost changes terminal wealth/CAGR but is not an extra elapsed day;
volatility/Sharpe score the actual N−1 return intervals. Backtest cash earns zero even when Sharpe
subtracts a nonzero external risk-free hurdle.

The backtest request's legacy benchmark field is retained for API compatibility but does not feed
its performance summary; benchmark comparisons are implemented in the risk workbench. Legacy
backtest undefined Sharpe/Calmar values use zero, unlike the richer risk workbench's null semantics.

## Primary references
- [CFA Institute, Portfolio Risk and Return](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/portfolio-risk-return-part-1)
- [CFA Institute, Sortino ratio methodology](https://rpc.cfainstitute.org/-/media/documents/code/gips/the-sortino-ratio.pdf)
- [yfinance download contract](https://ranaroussi.github.io/yfinance/reference/api/yfinance.download.html)
- [Ken French data library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html)
