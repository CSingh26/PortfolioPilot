from __future__ import annotations

import cvxpy as cp
import numpy as np
import pandas as pd


def risk_parity_weights(cov: pd.DataFrame, max_iter: int = 200, step: float = 0.05) -> np.ndarray:
    matrix = cov.values
    if not np.isfinite(matrix).all() or np.min(np.linalg.eigvalsh(matrix)) <= 1e-12:
        raise ValueError("Risk parity requires positive-definite covariance")
    # Log risk budgeting has first-order condition x_i (Sigma x)_i = 1/n.
    scaled = matrix / np.max(np.diag(matrix))
    x = cp.Variable(len(matrix), pos=True)
    problem = cp.Problem(
        cp.Minimize(0.5 * cp.quad_form(x, scaled) - cp.sum(cp.log(x)) / len(matrix))
    )
    problem.solve(solver="CLARABEL", tol_gap_abs=1e-10, tol_feas=1e-10, tol_gap_rel=1e-10)
    if x.value is None or problem.status != "optimal":
        raise ValueError("Risk parity solver failed")
    weights = x.value / x.value.sum()
    contributions = weights * (matrix @ weights)
    if not np.allclose(contributions / contributions.sum(), 1 / len(matrix), atol=1e-4):
        raise ValueError("Risk parity contribution convergence failed")
    return weights
