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


def target_return_unconstrained(
    mu: np.ndarray, cov: np.ndarray, target_return: float
) -> np.ndarray:
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
        raise ValueError("Constrained optimizer requires cvxpy")
    n = cov.shape[0]
    w = cp.Variable(n)
    objective = cp.Minimize(cp.quad_form(w, cov))
    constraints = [cp.sum(w) == 1, w >= 0]
    if max_weight is not None:
        constraints.append(w <= max_weight)
    _solve(cp.Problem(objective, constraints), ["OSQP", "SCS"])
    if w.value is None:
        raise ValueError("Optimization infeasible or solver failed")
    return _normalize(np.maximum(w.value, 0))


def target_return_long_only(
    mu: np.ndarray, cov: np.ndarray, target_return: float, max_weight: float | None = None
) -> np.ndarray:
    if cp is None:
        raise ValueError("Constrained optimizer requires cvxpy")
    n = len(mu)
    w = cp.Variable(n)
    objective = cp.Minimize(cp.quad_form(w, cov))
    constraints = [cp.sum(w) == 1, w >= 0, mu @ w == target_return]
    if max_weight is not None:
        constraints.append(w <= max_weight)
    _solve(cp.Problem(objective, constraints), ["OSQP", "SCS"])
    if w.value is None:
        raise ValueError("Optimization infeasible or solver failed")
    return _normalize(np.maximum(w.value, 0))


def max_sharpe_long_only(
    mu: np.ndarray, cov: np.ndarray, risk_free: float = 0.0, max_weight: float | None = None
) -> np.ndarray:
    # Positive excess return is required for the convex tangency transformation.
    if cp is None or np.max(mu - risk_free) <= 0:
        raise ValueError("Tangency optimization requires a positive expected excess return")
    n = len(mu)
    y = cp.Variable(n)
    constraints = [(mu - risk_free) @ y == 1, y >= 0]
    if max_weight is not None:
        constraints.append(y <= max_weight * cp.sum(y))
    problem = cp.Problem(cp.Minimize(cp.quad_form(y, cov)), constraints)
    _solve(problem, ["CLARABEL", "SCS"])
    if y.value is None or problem.status not in {"optimal", "optimal_inaccurate"}:
        raise ValueError("Optimization infeasible or solver failed")
    return _normalize(np.maximum(y.value, 0))


def efficient_frontier(
    mu: pd.Series,
    cov: pd.DataFrame,
    points: int = 25,
    long_only: bool = True,
    max_weight: float | None = None,
) -> pd.DataFrame:
    mu_values = mu.values
    cov_values = cov.values
    # Restrict targets to the cap-feasible return range.
    cap = max_weight or 1.0
    if long_only and cap * len(mu) < 1 - 1e-8:
        raise ValueError("max_weight is infeasible")

    def extreme(reverse):
        remaining, total = 1.0, 0.0
        for value in sorted(mu_values, reverse=reverse):
            allocation = min(cap, remaining)
            total += allocation * value
            remaining -= allocation
        return total

    target_returns = np.linspace(extreme(False), extreme(True), points)
    weights_list = []
    vol_list = []

    for target in target_returns:
        if long_only:
            weights = target_return_long_only(mu_values, cov_values, target, max_weight)
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
