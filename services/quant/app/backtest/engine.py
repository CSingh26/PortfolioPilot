from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import numpy as np
import pandas as pd

from .strategies import cvar_min, equal_weight, min_variance, momentum_12_1, risk_parity

Strategy = Literal[
    "buy_and_hold",
    "equal_weight",
    "momentum_12_1",
    "min_variance",
    "risk_parity",
    "vol_target",
    "cvar_min",
]


@dataclass
class BacktestOutput:
    equity_curve: pd.Series
    returns: pd.Series
    weights: pd.DataFrame
    turnover: pd.Series
    costs: pd.Series


def _extract_prices(ohlcv: pd.DataFrame) -> pd.DataFrame:
    if isinstance(ohlcv.columns, pd.MultiIndex):
        field = "adj_close" if "adj_close" in ohlcv.columns.levels[1] else "close"
        prices = ohlcv.xs(field, level=1, axis=1)
    else:
        prices = ohlcv
    return prices.dropna(how="all")


def _rebalance_dates(prices: pd.DataFrame, freq: str) -> list[pd.Timestamp]:
    resampled = prices.resample(freq).last().index
    return [date for date in resampled if date in prices.index]


def _compute_weights(
    strategy: Strategy,
    prices: pd.DataFrame,
    returns: pd.DataFrame,
    current: np.ndarray | None,
    max_weight: float | None,
) -> np.ndarray:
    if strategy == "buy_and_hold" and current is not None:
        return current
    if strategy == "buy_and_hold" or strategy == "equal_weight" or strategy == "vol_target":
        return equal_weight(prices.shape[1])
    if strategy == "momentum_12_1":
        return momentum_12_1(prices)
    if strategy == "min_variance":
        return min_variance(returns, max_weight=max_weight)
    if strategy == "risk_parity":
        return risk_parity(returns)
    if strategy == "cvar_min":
        return cvar_min(returns, max_weight=max_weight)
    return equal_weight(prices.shape[1])


def run_backtest(
    ohlcv: pd.DataFrame,
    strategy: Strategy,
    rebalance: str = "M",
    transaction_cost_bps: float = 5.0,
    slippage_bps: float = 2.0,
    lookback: int = 126,
    max_weight: float | None = None,
    vol_target: float | None = None,
) -> BacktestOutput:
    prices = _extract_prices(ohlcv)
    returns = prices.pct_change().dropna(how="all")
    if returns.empty:
        empty = pd.Series(dtype=float)
        return BacktestOutput(empty, empty, pd.DataFrame(), empty, empty)

    rebal_dates = _rebalance_dates(prices, rebalance)
    weights = pd.DataFrame(index=prices.index, columns=prices.columns, dtype=float)
    current: np.ndarray | None = None
    costs = pd.Series(0.0, index=prices.index)
    turnover = pd.Series(0.0, index=prices.index)
    cost_rate = (transaction_cost_bps + slippage_bps) / 10000

    for date in prices.index:
        if date in rebal_dates or current is None:
            window_prices = prices.loc[:date].tail(lookback + 21)
            window_returns = returns.loc[:date].tail(lookback)
            new_weights = _compute_weights(strategy, window_prices, window_returns, current, max_weight)
            if current is not None:
                turnover.loc[date] = np.abs(new_weights - current).sum()
                costs.loc[date] = turnover.loc[date] * cost_rate
            current = new_weights
        weights.loc[date] = current

    weights = weights.ffill().fillna(0)
    portfolio_returns = (weights.shift(1) * returns).sum(axis=1)
    portfolio_returns = portfolio_returns.sub(costs.reindex(portfolio_returns.index).fillna(0), fill_value=0)

    if strategy == "vol_target" or vol_target is not None:
        target = vol_target or 0.1
        daily_target = target / np.sqrt(252)
        ewma_vol = portfolio_returns.ewm(alpha=1 - 0.94, adjust=False).std().replace(0, np.nan)
        scale = (daily_target / ewma_vol).clip(lower=0, upper=2.5).fillna(1.0)
        portfolio_returns = portfolio_returns * scale

    equity_curve = (1 + portfolio_returns).cumprod()
    return BacktestOutput(
        equity_curve=equity_curve,
        returns=portfolio_returns,
        weights=weights,
        turnover=turnover,
        costs=costs,
    )
