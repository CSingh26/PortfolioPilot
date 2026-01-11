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
Normalize so \(\mathbf{1}^T w = 1\).

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

Equal risk contribution solves for \(\text{RC}_i = \sigma_p / n\) using iterative updates.

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

## 4. Volatility Targeting (EWMA)
EWMA volatility:
\[
\sigma_t^2 = \lambda \sigma_{t-1}^2 + (1-\lambda) r_t^2
\]

Scale returns by:
\[
\text{scale}_t = \frac{\sigma_{\text{target}}}{\sigma_t}
\]
