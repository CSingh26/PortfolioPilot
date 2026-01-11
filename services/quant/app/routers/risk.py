from __future__ import annotations

from fastapi import APIRouter

from ..analytics import (
    factor_regression,
    historical_cvar,
    historical_var,
    parametric_cvar,
    parametric_var,
    rolling_sharpe,
    rolling_vol,
)
from ..data import load_french_factors, load_ohlcv
from ..models import FactorRegressionRequest, FactorRegressionResult, RiskMetrics, RiskRequest, TimeSeries

router = APIRouter()


def _series_payload(series) -> TimeSeries:
    series = series.dropna()
    return TimeSeries(
        dates=[idx.date().isoformat() for idx in series.index],
        values=[float(value) for value in series.values],
    )


def _extract_prices(frame):
    if hasattr(frame.columns, "levels"):
        field = "adj_close" if "adj_close" in frame.columns.levels[1] else "close"
        return frame.xs(field, level=1, axis=1)
    return frame


@router.post("/risk/metrics", response_model=RiskMetrics)
def risk_metrics(request: RiskRequest) -> RiskMetrics:
    prices = load_ohlcv(request.tickers, request.start, request.end)
    if prices.empty:
        empty = TimeSeries(dates=[], values=[])
        return RiskMetrics(
            hist_var=0.0,
            hist_cvar=0.0,
            param_var=0.0,
            param_cvar=0.0,
            volatility=0.0,
            rolling_vol=empty,
            rolling_sharpe=empty,
        )

    prices = _extract_prices(prices)
    returns = prices.pct_change().dropna(how="all")
    portfolio = returns.mean(axis=1)

    hist_var = historical_var(portfolio, request.alpha)
    hist_cvar = historical_cvar(portfolio, request.alpha)
    param_var = parametric_var(portfolio, request.alpha)
    param_cvar = parametric_cvar(portfolio, request.alpha)
    vol = float(portfolio.std(ddof=1) * (252**0.5))

    return RiskMetrics(
        hist_var=hist_var,
        hist_cvar=hist_cvar,
        param_var=param_var,
        param_cvar=param_cvar,
        volatility=vol,
        rolling_vol=_series_payload(rolling_vol(portfolio)),
        rolling_sharpe=_series_payload(rolling_sharpe(portfolio)),
    )


@router.post("/risk/factors", response_model=FactorRegressionResult)
def risk_factors(request: FactorRegressionRequest) -> FactorRegressionResult:
    prices = load_ohlcv(request.tickers, request.start, request.end)
    if prices.empty:
        return FactorRegressionResult(coefficients={}, tstats={}, r2=0.0)

    prices = _extract_prices(prices)
    returns = prices.pct_change().dropna(how="all")
    portfolio = returns.mean(axis=1)

    factors = load_french_factors(request.start, request.end)
    regression = factor_regression(portfolio, factors)
    return FactorRegressionResult(
        coefficients=regression.get("coefficients", {}),
        tstats=regression.get("tstats", {}),
        r2=regression.get("r2", 0.0),
    )
