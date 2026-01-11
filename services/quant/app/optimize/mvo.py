from __future__ import annotations

import numpy as np
import pandas as pd

try:
    import cvxpy as cp
except Exception:  # pragma: no cover
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
    total = weights.sum()
    if total == 0:
        return np.ones_like(weights) / len(weights)
    return weights / total


def min_variance_unconstrained(cov: np.ndarray) -> np.ndarray:
    inv = np.linalg.pinv(cov)
    ones = np.ones(cov.shape[0])
    weights = inv @ ones
    return _normalize(weights)


def max_sharpe_unconstrained(mu: np.ndarray, cov: np.ndarray, risk_free: float = 0.0) -> np.ndarray:
    inv = np.linalg.pinv(cov)
    excess = mu - risk_free
    weights = inv @ excess
    return _normalize(weights)


def target_return_unconstrained(mu: np.ndarray, cov: np.ndarray, target_return: float) -> np.ndarray:
    n = len(mu)
    ones = np.ones(n)
    kkt = np.block(
        [
            [2 * cov, ones[:, None], mu[:, None]],
            [ones[None, :], np.zeros((1, 1)), np.zeros((1, 1))],
            [mu[None, :], np.zeros((1, 1)), np.zeros((1, 1))],
        ]
    )
    rhs = np.concatenate([np.zeros(n), [1.0, target_return]])
    solution = np.linalg.solve(kkt, rhs)
    return solution[:n]


def min_variance_long_only(cov: np.ndarray, max_weight: float | None = None) -> np.ndarray:
    if cp is None:
        return min_variance_unconstrained(cov)
    n = cov.shape[0]
    w = cp.Variable(n)
    objective = cp.Minimize(cp.quad_form(w, cov))
    constraints = [cp.sum(w) == 1, w >= 0]
    if max_weight is not None:
        constraints.append(w <= max_weight)
    _solve(cp.Problem(objective, constraints), ["OSQP", "SCS"])
    return _normalize(w.value if w.value is not None else np.ones(n))


def target_return_long_only(
    mu: np.ndarray, cov: np.ndarray, target_return: float, max_weight: float | None = None
) -> np.ndarray:
    if cp is None:
        return target_return_unconstrained(mu, cov, target_return)
    n = len(mu)
    w = cp.Variable(n)
    objective = cp.Minimize(cp.quad_form(w, cov))
    constraints = [cp.sum(w) == 1, w >= 0, mu @ w >= target_return]
    if max_weight is not None:
        constraints.append(w <= max_weight)
    _solve(cp.Problem(objective, constraints), ["OSQP", "SCS"])
    return _normalize(w.value if w.value is not None else np.ones(n))


def max_sharpe_long_only(mu: np.ndarray, cov: np.ndarray, risk_free: float = 0.0) -> np.ndarray:
    if cp is None:
        return max_sharpe_unconstrained(mu, cov, risk_free)
    n = len(mu)
    w = cp.Variable(n)
    objective = cp.Maximize((mu - risk_free) @ w)
    constraints = [cp.quad_form(w, cov) <= 1, w >= 0]
    _solve(cp.Problem(objective, constraints), ["SCS", "OSQP"])
    if w.value is None:
        return _normalize(np.ones(n))
    return _normalize(w.value)


def efficient_frontier(
    mu: pd.Series, cov: pd.DataFrame, points: int = 25, long_only: bool = True
) -> pd.DataFrame:
    mu_values = mu.values
    cov_values = cov.values
    target_returns = np.linspace(mu.min(), mu.max(), points)
    weights_list = []
    vol_list = []

    for target in target_returns:
        if long_only:
            weights = target_return_long_only(mu_values, cov_values, target)
        else:
            weights = target_return_unconstrained(mu_values, cov_values, target)
        vol = float(np.sqrt(weights.T @ cov_values @ weights))
        weights_list.append(weights)
        vol_list.append(vol)

    return pd.DataFrame(
        {
            "target_return": target_returns,
            "volatility": vol_list,
            "weights": weights_list,
        }
    )
