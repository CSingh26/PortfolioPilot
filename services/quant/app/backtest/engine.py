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
    from ..data.panel import validated_prices

    return validated_prices(ohlcv)


def _rebalance_dates(prices: pd.DataFrame, freq: str) -> list[pd.Timestamp]:
    if freq not in {"M", "W", "Q"}:
        raise ValueError("rebalance must be M, W or Q")
    # Select actual final observations, including calendar ends falling on weekends.
    return prices.groupby(prices.index.to_period(freq)).tail(1).index.tolist()


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
    if (
        not np.isfinite([transaction_cost_bps, slippage_bps]).all()
        or min(transaction_cost_bps, slippage_bps) < 0
        or max(transaction_cost_bps, slippage_bps) > 1000
    ):
        raise ValueError("Costs must be finite basis points between 0 and 1000")
    if max_weight is not None and strategy not in {"min_variance", "cvar_min"}:
        raise ValueError("Weight caps are supported only for min_variance and cvar_min")
    if max_weight is not None and (max_weight <= 0 or max_weight > 1):
        raise ValueError("max_weight must be in (0, 1]")
    if vol_target is not None and (not np.isfinite(vol_target) or not 0 < vol_target <= 1):
        raise ValueError("vol_target must be in (0, 1]")
    if lookback < 2:
        raise ValueError("lookback must be at least 2")
    prices = _extract_prices(ohlcv)
    if max_weight is not None and max_weight * prices.shape[1] < 1 - 1e-8:
        raise ValueError("max_weight is infeasible")
    returns = prices.pct_change(fill_method=None).iloc[1:]
    rebal_dates = set(_rebalance_dates(prices, rebalance))
    weights = pd.DataFrame(0.0, index=prices.index, columns=prices.columns)
    costs = pd.Series(0.0, index=prices.index)
    turnover = costs.copy()
    portfolio_returns = costs.copy()
    current = np.zeros(prices.shape[1])
    invested = False
    cost_rate = (transaction_cost_bps + slippage_bps) / 10000
    warmup = 252 if strategy == "momentum_12_1" else lookback
    estimated = (
        strategy in {"momentum_12_1", "min_variance", "risk_parity", "cvar_min", "vol_target"}
        or vol_target is not None
    )
    if estimated and len(returns) <= warmup:
        raise ValueError("Insufficient history for strategy warm-up")

    for i, date in enumerate(prices.index):
        gross = 0.0 if i == 0 else float(current @ returns.loc[date].values)
        if gross <= -1:
            raise ValueError("Portfolio insolvency under supplied returns")
        # Holdings drift as prices change; cash earns zero and leverage is not used.
        drifted = current if i == 0 else current * (1 + returns.loc[date].values) / (1 + gross)
        new_weights = drifted.copy()
        enough_history = not estimated or i >= warmup
        should_trade = enough_history and (not invested or date in rebal_dates)
        if strategy == "buy_and_hold" and invested:
            should_trade = False
        # No unnecessary terminal trade. Decisions at t affect returns at t+1 only.
        if should_trade and i < len(prices) - 1:
            window_prices = prices.loc[:date].tail(max(lookback + 1, 253))
            window_returns = returns.loc[:date].tail(lookback)
            new_weights = _compute_weights(
                strategy, window_prices, window_returns, None, max_weight
            )
            if strategy == "vol_target" or vol_target is not None:
                realized = float((window_returns @ new_weights).std(ddof=1) * np.sqrt(252))
                scale = min(1.0, (vol_target or 0.1) / realized) if realized > 1e-12 else 0.0
                new_weights = new_weights * scale
            traded = float(np.abs(new_weights - drifted).sum())
            turnover.loc[date] = traded
            costs.loc[date] = traded * cost_rate
            invested = True
        # Cost is charged on post-return wealth; the next weights are fractions of net wealth.
        portfolio_returns.loc[date] = (1 + gross) * (1 - costs.loc[date]) - 1
        current = new_weights
        weights.loc[date] = current

    equity_curve = (1 + portfolio_returns).cumprod()
    return BacktestOutput(equity_curve, portfolio_returns, weights, turnover, costs)
