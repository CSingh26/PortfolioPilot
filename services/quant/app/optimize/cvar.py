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


def cvar_optimize(
    returns: pd.DataFrame, alpha: float = 0.95, max_weight: float | None = None
) -> np.ndarray:
    if returns.empty:
        return np.array([])
    if cp is None:
        return np.ones(returns.shape[1]) / returns.shape[1]

    matrix = returns.values
    t_len, n_assets = matrix.shape

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
        return np.ones(n_assets) / n_assets
    weights = np.maximum(w.value, 0)
    return weights / weights.sum()
