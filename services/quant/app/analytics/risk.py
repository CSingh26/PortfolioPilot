from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import norm


def historical_var(returns: pd.Series, alpha: float = 0.95) -> float:
    if returns.empty:
        return 0.0
    return float(np.quantile(returns, 1 - alpha))


def historical_cvar(returns: pd.Series, alpha: float = 0.95) -> float:
    if returns.empty:
        return 0.0
    var = historical_var(returns, alpha)
    tail = returns[returns <= var]
    if tail.empty:
        return var
    return float(tail.mean())


def parametric_var(returns: pd.Series, alpha: float = 0.95) -> float:
    if returns.empty:
        return 0.0
    mu = returns.mean()
    sigma = returns.std(ddof=1)
    return float(mu + sigma * norm.ppf(1 - alpha))


def parametric_cvar(returns: pd.Series, alpha: float = 0.95) -> float:
    if returns.empty:
        return 0.0
    mu = returns.mean()
    sigma = returns.std(ddof=1)
    z = norm.ppf(1 - alpha)
    return float(mu - sigma * norm.pdf(z) / (1 - alpha))


def rolling_vol(returns: pd.Series, window: int = 63) -> pd.Series:
    return returns.rolling(window=window).std(ddof=1)


def rolling_sharpe(returns: pd.Series, window: int = 63, risk_free: float = 0.0) -> pd.Series:
    if returns.empty:
        return pd.Series(dtype=float)
    excess = returns - risk_free / 252
    vol = excess.rolling(window=window).std(ddof=1)
    mean = excess.rolling(window=window).mean()
    return mean / vol * np.sqrt(252)
