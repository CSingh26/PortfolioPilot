"""Descriptive daily-rebalanced risk, not a strategy performance forecast."""

import hashlib

import numpy as np
import pandas as pd

from ..models import RiskRequest, TimeSeries
from .risk import historical_cvar, historical_var, parametric_cvar, parametric_var


def series_payload(series: pd.Series) -> TimeSeries:
    series = series.replace([np.inf, -np.inf], np.nan).dropna()
    return TimeSeries(
        dates=[x.date().isoformat() for x in series.index], values=series.astype(float).tolist()
    )


def ratio(numerator, denominator):
    return float(numerator / denominator) if abs(denominator) > 1e-12 else None


def analyze(prices: pd.DataFrame, request: RiskRequest, source: str) -> dict:
    returns = prices.pct_change(fill_method=None).iloc[1:]
    assets = returns[request.tickers]
    w = np.array(
        [
            request.weights[t] if request.weights else 1 / len(request.tickers)
            for t in request.tickers
        ]
    )
    portfolio = assets @ w
    benchmark = returns[request.benchmark]
    daily_rf = (1 + request.risk_free) ** (1 / 252) - 1
    excess = portfolio - daily_rf
    cov = assets.cov() * 252
    vol = float(portfolio.std(ddof=1) * np.sqrt(252))
    expected = float(portfolio.mean() * 252)
    downside = float(np.sqrt(np.mean(np.minimum(excess, 0) ** 2) * 252))
    beta = ratio(portfolio.cov(benchmark), benchmark.var(ddof=1))
    benchmark_return = float(benchmark.mean() * 252)
    # CAPM uses the same arithmetic annual risk-free convention as excess returns.
    capm = None if beta is None else 252 * daily_rf + beta * (benchmark_return - 252 * daily_rf)
    equity = pd.concat([pd.Series([1.0], index=prices.index[:1]), (1 + portfolio).cumprod()])
    drawdown = equity / equity.cummax() - 1
    contributions = w * (cov.values @ w) / vol if vol > 1e-12 else np.zeros(len(w))
    warnings = [
        "Daily constant weights imply rebalancing; descriptive metrics exclude costs.",
        "Historical estimates are in-sample, revised-data dependent, and not forecasts.",
    ]
    if len(returns) < 252:
        warnings.append(
            "Less than one trading year: annualized estimates and tail statistics are unstable."
        )
    if len(returns) * (1 - request.alpha) < 20:
        warnings.append(
            "Fewer than 20 expected tail observations: VaR/CVaR have substantial sampling uncertainty."
        )
    if vol < 1e-12 or beta is None or downside < 1e-12:
        warnings.append("Undefined ratios are null when total/downside/benchmark variance is zero.")
    corr = assets.corr()
    return dict(
        hist_var=historical_var(portfolio, request.alpha),
        hist_cvar=historical_cvar(portfolio, request.alpha),
        param_var=parametric_var(portfolio, request.alpha),
        param_cvar=parametric_cvar(portfolio, request.alpha),
        volatility=vol,
        expected_return=expected,
        excess_return=float(excess.mean() * 252),
        cagr=float(equity.iloc[-1] ** (252 / len(returns)) - 1),
        sharpe=ratio(excess.mean() * 252, vol),
        sortino=ratio(excess.mean() * 252, downside),
        downside_deviation=downside,
        max_drawdown=float(drawdown.min()),
        beta=beta,
        capm_return=capm,
        alpha=None if capm is None else expected - capm,
        benchmark_return=benchmark_return,
        diversification_ratio=ratio(w @ np.sqrt(np.diag(cov)), vol),
        risk_contribution=dict(zip(request.tickers, contributions.tolist())),
        asset_metrics={
            t: {
                "expected_return": float(assets[t].mean() * 252),
                "volatility": float(assets[t].std(ddof=1) * np.sqrt(252)),
                "weight": float(w[i]),
            }
            for i, t in enumerate(request.tickers)
        },
        covariance={t: {u: float(cov.loc[t, u]) for u in request.tickers} for t in request.tickers},
        correlation={
            t: {
                u: float(corr.loc[t, u]) if pd.notna(corr.loc[t, u]) else None
                for u in request.tickers
            }
            for t in request.tickers
        },
        stress_return=float(
            sum(w[i] * request.shocks.get(t, 0) for i, t in enumerate(request.tickers))
        ),
        returns=series_payload(portfolio),
        equity_curve=series_payload(equity),
        drawdown=series_payload(drawdown),
        rolling_vol=series_payload(portfolio.rolling(63).std(ddof=1) * np.sqrt(252)),
        rolling_sharpe=series_payload(
            excess.rolling(63).mean() / portfolio.rolling(63).std(ddof=1) * np.sqrt(252)
        ),
        metadata={
            "source": source,
            "observations": len(returns),
            "price_observations": len(prices),
            "start": str(prices.index[0].date()),
            "end": str(prices.index[-1].date()),
            "frequency": "daily",
            "periods_per_year": 252,
            "confidence": request.alpha,
            "benchmark": request.benchmark,
            "risk_free_annual_effective": request.risk_free,
            "input_sha256": hashlib.sha256(
                prices.to_csv(float_format="%.17g").encode()
            ).hexdigest(),
            "assumptions": "Adjusted prices; complete common calendar; long-only daily constant weights",
            "warnings": warnings,
        },
    )
