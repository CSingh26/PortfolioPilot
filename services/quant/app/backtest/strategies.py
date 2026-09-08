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
    if len(prices) < lookback + 1:
        raise ValueError("Momentum needs 253 prices for a 12-minus-1-month signal")
    signal = prices.iloc[-(skip + 1)] / prices.iloc[-(lookback + 1)] - 1
    top_k = max(1, int(np.ceil(len(signal) / 3)))
    leaders = signal.sort_values(ascending=False).head(top_k).index
    weights = pd.Series(0.0, index=prices.columns)
    weights.loc[leaders] = 1 / top_k
    return weights.values


def min_variance(returns: pd.DataFrame, max_weight: float | None = None) -> np.ndarray:
    from ..optimize.mvo import min_variance_long_only

    return min_variance_long_only(returns.cov().values, max_weight)


def risk_parity(returns: pd.DataFrame, max_iter: int = 200, step: float = 0.05) -> np.ndarray:
    from ..optimize.risk_parity import risk_parity_weights

    return risk_parity_weights(returns.cov())


def cvar_min(
    returns: pd.DataFrame, alpha: float = 0.95, max_weight: float | None = None
) -> np.ndarray:
    from ..optimize.cvar import cvar_optimize

    return cvar_optimize(returns, alpha, max_weight)
