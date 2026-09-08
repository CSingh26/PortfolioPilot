from __future__ import annotations

from fastapi import APIRouter

from ..data import load_ohlcv
from ..data.panel import validated_prices
from ..models import OptimizationRequest, OptimizationResult
from ..optimize import (
    cvar_optimize,
    efficient_frontier,
    max_sharpe_long_only,
    max_sharpe_unconstrained,
    risk_parity_weights,
    target_return_long_only,
    target_return_unconstrained,
)

router = APIRouter()


def _extract_prices(frame):
    if hasattr(frame.columns, "levels"):
        field = "adj_close" if "adj_close" in frame.columns.levels[1] else "close"
        return frame.xs(field, level=1, axis=1)
    return frame


@router.post("/optimize", response_model=OptimizationResult)
def optimize(request: OptimizationRequest) -> OptimizationResult:
    prices = load_ohlcv(request.tickers, request.start, request.end)
    prices = validated_prices(prices, request.tickers)
    returns = prices.pct_change(fill_method=None).iloc[1:]
    if request.max_weight is not None and request.max_weight * len(request.tickers) < 1 - 1e-8:
        raise ValueError("max_weight is infeasible")
    if request.method == "risk_parity" and request.max_weight is not None:
        raise ValueError("Risk parity does not support weight caps")
    if request.method != "mvo" and not request.long_only:
        raise ValueError("Only MVO supports unconstrained weights")
    if not request.long_only and request.max_weight is not None:
        raise ValueError("Weight caps require long-only MVO")

    mu = returns.mean() * 252
    cov = returns.cov() * 252

    if request.method == "mvo":
        if request.target_return is not None:
            weights = (
                target_return_long_only(
                    mu.values, cov.values, request.target_return, request.max_weight
                )
                if request.long_only
                else target_return_unconstrained(mu.values, cov.values, request.target_return)
            )
        else:
            weights = (
                max_sharpe_long_only(
                    mu.values, cov.values, request.risk_free or 0.0, request.max_weight
                )
                if request.long_only
                else max_sharpe_unconstrained(mu.values, cov.values, request.risk_free or 0.0)
            )
        frontier_frame = efficient_frontier(
            mu,
            cov,
            points=request.frontier_points,
            long_only=request.long_only,
            max_weight=request.max_weight,
        )
        frontier = [
            {
                "expected_return": float(row["target_return"]),
                "expected_vol": float(row["volatility"]),
            }
            for _, row in frontier_frame.iterrows()
        ]
    elif request.method == "risk_parity":
        weights = risk_parity_weights(cov)
        frontier = None
    else:
        weights = cvar_optimize(returns, alpha=request.alpha, max_weight=request.max_weight)
        frontier = None

    expected_return = float(weights @ mu.values)
    expected_vol = float((weights.T @ cov.values @ weights) ** 0.5)
    sharpe = (expected_return - (request.risk_free or 0.0)) / expected_vol if expected_vol else 0.0

    return OptimizationResult(
        weights={ticker: float(weight) for ticker, weight in zip(request.tickers, weights)},
        expected_return=expected_return,
        expected_vol=expected_vol,
        sharpe=sharpe,
        frontier=frontier,
    )
