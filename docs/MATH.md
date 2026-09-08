# PortfolioPilot Quant Math

## 1. Mean-Variance Optimization (MVO)

### Setup
Let returns be a random vector \(r \in \mathbb{R}^n\) with mean \(\mu\) and covariance \(\Sigma\). Portfolio weights are \(w\).

The minimum-variance problem with a budget constraint is:

\[
\min_{w} \quad w^T \Sigma w \quad \text{s.t.} \quad \mathbf{1}^T w = 1
\]

### Closed-form solution (equality constrained)
Lagrangian:
\[
\mathcal{L}(w, \lambda) = w^T \Sigma w - \lambda (\mathbf{1}^T w - 1)
\]

First-order condition:
\[
2\Sigma w - \lambda \mathbf{1} = 0
\]

Solve for \(w\):
\[
\Sigma w = \tfrac{\lambda}{2} \mathbf{1}
\Rightarrow w = \tfrac{\lambda}{2} \Sigma^{-1} \mathbf{1}
\]

Apply the constraint \(\mathbf{1}^T w = 1\):
\[
\tfrac{\lambda}{2} \mathbf{1}^T \Sigma^{-1} \mathbf{1} = 1
\Rightarrow \lambda = \frac{2}{\mathbf{1}^T \Sigma^{-1} \mathbf{1}}
\]

Thus the minimum-variance weights are:
\[
\boxed{w^{\star} = \frac{\Sigma^{-1} \mathbf{1}}{\mathbf{1}^T \Sigma^{-1} \mathbf{1}}}
\]

### Target return (KKT / block matrix)
For a target return \(\mu^T w = \mu_{\text{target}}\), solve:

\[
\min_{w} \quad w^T \Sigma w \quad \text{s.t.} \quad \mathbf{1}^T w = 1, \; \mu^T w = \mu_{\text{target}}
\]

KKT system:
\[
\begin{bmatrix}
2\Sigma & \mathbf{1} & \mu \\
\mathbf{1}^T & 0 & 0 \\
\mu^T & 0 & 0
\end{bmatrix}
\begin{bmatrix}
 w \\
 \lambda \\
 \gamma
\end{bmatrix}
=
\begin{bmatrix}
 0 \\
 1 \\
 \mu_{\text{target}}
\end{bmatrix}
\]

Solve the linear system to obtain \(w\).

### Maximum Sharpe (unconstrained)
With risk-free rate \(r_f\), the tangency portfolio is:
\[
\boxed{w^{\star} \propto \Sigma^{-1} (\mu - r_f \mathbf{1})}
\]
Normalize so \(\mathbf{1}^T w = 1\), only when the normalization denominator is positive; otherwise this implementation rejects the unsupported tangency direction.

### Long-only (constrained)
For long-only and weight caps, PortfolioPilot solves convex QPs:

\[
\min_w \; w^T \Sigma w \quad \text{s.t.} \quad \mathbf{1}^T w = 1, \; w \ge 0, \; w \le w_{\max}
\]

## 2. Risk Parity
Risk contributions use:
\[
\sigma_p = \sqrt{w^T \Sigma w}
\]
\[
\text{RC}_i = w_i (\Sigma w)_i / \sigma_p
\]

Equal risk contribution solves for \(\text{RC}_i = \sigma_p / n\) using a convex log-budgeting objective with a verified contribution residual.

## 3. Value at Risk (VaR) and CVaR

### Historical VaR
\[
\text{VaR}_{\alpha} = \text{Quantile}_{1-\alpha}(r)
\]

### Parametric VaR (Normal)
\[
\text{VaR}_{\alpha} = \mu_r + \sigma_r \Phi^{-1}(1-\alpha)
\]

### CVaR (Expected Shortfall)
\[
\text{CVaR}_{\alpha} = E[r \mid r \le \text{VaR}_{\alpha}]
\]

### CVaR optimization (LP)
Given returns \(r_t\), minimize
\[
\min_{w, z, u} \; z + \frac{1}{(1-\alpha)T} \sum_{t=1}^T u_t
\]

Subject to:
\[
 u_t \ge -r_t^T w - z, \quad u_t \ge 0, \quad \mathbf{1}^T w = 1, \quad w \ge 0
\]

## 4. Volatility targeting with lagged holdings

At a rebalance close, estimate annualized sample volatility of the base allocation using only
returns observed through that date. Scale the next interval's asset weights by
`min(1, target_volatility / estimated_volatility)`. Zero estimated volatility implies zero
risky exposure. The remaining wealth is zero-yield cash. There is no leverage and no same-period
rescaling of realized returns. Trading costs are computed after the target weights change.

## 5. Risk workbench conventions

Portfolio volatility is `sqrt(wᵀΣw)` using sample covariance × 252. Downside deviation is
`sqrt(252 × mean(min(portfolio_return − daily_rf, 0)²))`, using all observations. Sharpe and
Sortino divide annualized arithmetic excess return by total and downside volatility respectively.
Undefined risk-workbench ratios are null. Daily risk-free rate is `(1 + annual_effective_rf)^(1/252)−1`.

Drawdown includes initial capital before the first return. Risk snapshots assume daily constant
weights without costs. Their VaR/CVaR outputs are signed one-day returns, not annualized positive
losses. Benchmark CAPM and Euler risk attribution describe the historical sample rather than
predicting returns or proving investment skill.

The complete [methodology](https://github.com/CSingh26/PortfolioPilot/blob/main/docs/METHODOLOGY.md)
documents all estimators, units, data restrictions, cost conventions and limitations.
