from __future__ import annotations

from fastapi import APIRouter

from ..analytics import (
    factor_regression,
)
from ..data import load_french_factors, load_ohlcv
from ..models import (
    FactorRegressionRequest,
    FactorRegressionResult,
    RiskMetrics,
    RiskRequest,
    TimeSeries,
)

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
    import pandas as pd
    from fastapi import HTTPException

    from ..analytics.laboratory import analyze
    from ..data.panel import validated_prices

    required = list(dict.fromkeys(request.tickers + [request.benchmark]))
    try:
        if request.history:
            frame = pd.DataFrame(
                request.history.prices, index=pd.to_datetime(request.history.dates)
            )
            source = request.history.source
        else:
            frame = load_ohlcv(required, request.start, request.end)
            source = (
                "Yahoo Finance via yfinance; adjusted close; local cache may contain revised data"
            )
        frame = validated_prices(frame, required)
        frame = frame.loc[
            (frame.index >= pd.Timestamp(request.start)) & (frame.index < pd.Timestamp(request.end))
        ]
        frame = validated_prices(frame, required)
        return RiskMetrics(**analyze(frame, request, source))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/risk/factors", response_model=FactorRegressionResult)
def risk_factors(request: FactorRegressionRequest) -> FactorRegressionResult:
    prices = load_ohlcv(request.tickers, request.start, request.end)
    if prices.empty:
        raise ValueError("Market data unavailable for factor regression")

    from ..data.panel import validated_prices

    prices = validated_prices(prices, request.tickers)
    returns = prices.pct_change(fill_method=None).iloc[1:]
    portfolio = returns.mean(axis=1)

    factors = load_french_factors(request.start, request.end)
    regression = factor_regression(portfolio, factors)
    if not regression:
        raise ValueError("Aligned factor data unavailable")
    return FactorRegressionResult(
        coefficients=regression.get("coefficients", {}),
        tstats=regression.get("tstats", {}),
        r2=regression.get("r2", 0.0),
    )
