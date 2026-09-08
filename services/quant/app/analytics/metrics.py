from __future__ import annotations

import numpy as np
import pandas as pd


def annualize_return(returns: pd.Series, periods_per_year: int = 252) -> float:
    if returns.empty:
        return 0.0
    compounded = (1 + returns).prod()
    n_periods = len(returns)
    return compounded ** (periods_per_year / n_periods) - 1


def annualize_volatility(returns: pd.Series, periods_per_year: int = 252) -> float:
    if returns.empty:
        return 0.0
    return returns.std(ddof=1) * np.sqrt(periods_per_year)


def sharpe_ratio(
    returns: pd.Series, risk_free: float = 0.0, periods_per_year: int = 252
) -> float | None:
    if len(returns) < 2:
        return None
    excess = returns - ((1 + risk_free) ** (1 / periods_per_year) - 1)
    denom = excess.std(ddof=1)
    if not np.isfinite(denom) or denom <= 1e-12:
        return None
    return float(excess.mean() / denom * np.sqrt(periods_per_year))


def drawdown_curve(equity: pd.Series) -> pd.Series:
    if equity.empty:
        return equity
    peak = equity.cummax().clip(lower=1.0)
    return equity / peak - 1.0


def max_drawdown(drawdown: pd.Series) -> float:
    if drawdown.empty:
        return 0.0
    return float(drawdown.min())
