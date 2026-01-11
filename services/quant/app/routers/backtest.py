from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter

from ..analytics import annualize_return, annualize_volatility, drawdown_curve, max_drawdown, sharpe_ratio
from ..backtest import run_backtest
from ..config import settings
from ..data import load_ohlcv
from ..models import BacktestRequest, BacktestResult, RunSummary, TimeSeries, WeightSeries

router = APIRouter()


def _series_to_payload(series) -> TimeSeries:
    series = series.dropna()
    return TimeSeries(
        dates=[idx.date().isoformat() for idx in series.index],
        values=[float(value) for value in series.values],
    )


@router.post("/backtest", response_model=BacktestResult)
def run_backtest_route(request: BacktestRequest) -> BacktestResult:
    tickers = request.tickers or settings.default_universe
    ohlcv = load_ohlcv(tickers, request.start, request.end)
    output = run_backtest(
        ohlcv=ohlcv,
        strategy=request.strategy,
        rebalance=request.rebalance,
        transaction_cost_bps=request.transaction_cost_bps,
        slippage_bps=request.slippage_bps,
        lookback=request.lookback_window,
        max_weight=request.max_weight,
        vol_target=request.vol_target,
    )

    drawdown = drawdown_curve(output.equity_curve)
    cagr = annualize_return(output.returns)
    vol = annualize_volatility(output.returns)
    sharpe = sharpe_ratio(output.returns, risk_free=request.risk_free or 0.0)
    max_dd = max_drawdown(drawdown)
    calmar = cagr / abs(max_dd) if max_dd != 0 else 0.0

    weights_frame = output.weights.copy()
    weights_frame.columns = [
        col[0] if isinstance(col, tuple) else str(col) for col in weights_frame.columns
    ]
    weights_payload = WeightSeries(
        dates=[idx.date().isoformat() for idx in weights_frame.index],
        weights={
            col: weights_frame[col].fillna(0).astype(float).tolist() for col in weights_frame
        },
    )

    summary = RunSummary(cagr=cagr, vol=vol, sharpe=sharpe, max_drawdown=max_dd, calmar=calmar)

    return BacktestResult(
        run_id=str(uuid4()),
        summary=summary,
        equity_curve=_series_to_payload(output.equity_curve),
        returns=_series_to_payload(output.returns),
        drawdown=_series_to_payload(drawdown),
        weights=weights_payload,
        turnover=_series_to_payload(output.turnover),
        costs=_series_to_payload(output.costs),
    )
