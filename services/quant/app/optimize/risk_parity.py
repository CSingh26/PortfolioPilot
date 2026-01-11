from __future__ import annotations

import numpy as np
import pandas as pd


def risk_parity_weights(cov: pd.DataFrame, max_iter: int = 200, step: float = 0.05) -> np.ndarray:
    matrix = cov.values
    n = matrix.shape[0]
    weights = np.ones(n) / n
    for _ in range(max_iter):
        portfolio_vol = np.sqrt(weights.T @ matrix @ weights)
        if portfolio_vol == 0:
            break
        marginal = matrix @ weights / portfolio_vol
        risk_contrib = weights * marginal
        target = portfolio_vol / n
        gradient = risk_contrib - target
        weights -= step * gradient
        weights = np.clip(weights, 1e-6, None)
        weights = weights / weights.sum()
        if np.linalg.norm(gradient) < 1e-4:
            break
    return weights
