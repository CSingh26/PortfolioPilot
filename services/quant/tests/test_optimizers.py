import numpy as np
import pandas as pd

from app.optimize import (
    cvar_optimize,
    min_variance_long_only,
    risk_parity_weights,
    target_return_unconstrained,
)


def test_min_variance_long_only_weights_sum_to_one():
    cov = np.array([[0.04, 0.01], [0.01, 0.09]])
    weights = min_variance_long_only(cov)
    assert np.isclose(weights.sum(), 1.0)
    assert (weights >= 0).all()


def test_risk_parity_weights_sum_to_one():
    cov = pd.DataFrame([[0.04, 0.01], [0.01, 0.09]])
    weights = risk_parity_weights(cov)
    assert np.isclose(weights.sum(), 1.0)


def test_cvar_optimize_weights_shape():
    returns = pd.DataFrame(
        {
            "A": [0.01, -0.02, 0.015, -0.005],
            "B": [0.005, -0.01, 0.02, -0.003],
        }
    )
    weights = cvar_optimize(returns, alpha=0.95)
    assert weights.shape[0] == 2
    assert np.isclose(weights.sum(), 1.0)


def test_target_return_unconstrained_hits_target():
    mu = np.array([0.08, 0.12])
    cov = np.array([[0.04, 0.01], [0.01, 0.09]])
    target = 0.1
    weights = target_return_unconstrained(mu, cov, target)
    realized = float(weights @ mu)
    assert np.isclose(realized, target, atol=1e-3)
