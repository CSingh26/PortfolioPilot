from __future__ import annotations

import numpy as np
import pandas as pd

try:
    import cvxpy as cp
except Exception:  # pragma: no cover - optional dependency for constraints
    cp = None


def _pick_solver(preferred: list[str]) -> str | None:
    if cp is None:
        return None
    for name in preferred:
        if name in cp.installed_solvers():
            return name
    return None


def _solve(problem: "cp.Problem", preferred: list[str]) -> None:
    solver = _pick_solver(preferred)
    if solver:
        problem.solve(solver=solver, warm_start=True)
    else:
        problem.solve(warm_start=True)


def _normalize(weights: np.ndarray) -> np.ndarray:
    weights = np.clip(weights, 0, None)
    total = weights.sum()
    if total == 0:
        return np.ones_like(weights) / len(weights)
    return weights / total


def equal_weight(n_assets: int) -> np.ndarray:
    return np.ones(n_assets) / n_assets


def momentum_12_1(prices: pd.DataFrame, lookback: int = 252, skip: int = 21) -> np.ndarray:
    if len(prices) < lookback + skip:
        return equal_weight(prices.shape[1])
    window = prices.iloc[-(lookback + skip) : -skip]
    returns = window.iloc[-1] / window.iloc[0] - 1
    top_k = max(1, int(np.ceil(len(returns) / 3)))
    leaders = returns.sort_values(ascending=False).head(top_k).index
    weights = pd.Series(0.0, index=prices.columns)
    weights.loc[leaders] = 1 / top_k
    return weights.values


def min_variance(returns: pd.DataFrame, max_weight: float | None = None) -> np.ndarray:
    cov = returns.cov()
    n_assets = cov.shape[0]
    if cp is None:
        inv = np.linalg.pinv(cov.values)
        raw = inv @ np.ones(n_assets)
        return _normalize(raw)

    w = cp.Variable(n_assets)
    objective = cp.Minimize(cp.quad_form(w, cov.values))
    constraints = [cp.sum(w) == 1, w >= 0]
    if max_weight is not None:
        constraints.append(w <= max_weight)
    _solve(cp.Problem(objective, constraints), ["OSQP", "SCS"])
    if w.value is None:
        return equal_weight(n_assets)
    return _normalize(w.value)


def risk_parity(returns: pd.DataFrame, max_iter: int = 200, step: float = 0.05) -> np.ndarray:
    cov = returns.cov().values
    n_assets = cov.shape[0]
    weights = equal_weight(n_assets)
    for _ in range(max_iter):
        portfolio_vol = np.sqrt(weights.T @ cov @ weights)
        if portfolio_vol == 0:
            break
        marginal = cov @ weights / portfolio_vol
        risk_contrib = weights * marginal
        target = portfolio_vol / n_assets
        gradient = risk_contrib - target
        weights -= step * gradient
        weights = _normalize(weights)
        if np.linalg.norm(gradient) < 1e-4:
            break
    return weights


def cvar_min(returns: pd.DataFrame, alpha: float = 0.95, max_weight: float | None = None) -> np.ndarray:
    if cp is None:
        return equal_weight(returns.shape[1])

    matrix = returns.values
    n_assets = matrix.shape[1]
    t_len = matrix.shape[0]

    w = cp.Variable(n_assets)
    z = cp.Variable()
    u = cp.Variable(t_len)
    losses = -matrix @ w

    objective = cp.Minimize(z + (1 / ((1 - alpha) * t_len)) * cp.sum(u))
    constraints = [u >= losses - z, u >= 0, cp.sum(w) == 1, w >= 0]
    if max_weight is not None:
        constraints.append(w <= max_weight)

    _solve(cp.Problem(objective, constraints), ["ECOS", "SCS"])

    if w.value is None:
        return equal_weight(n_assets)
    return _normalize(w.value)
