from __future__ import annotations

from datetime import date
from uuid import uuid4
from fastapi import APIRouter

from ..config import settings
from ..models import BacktestRequest, BacktestResult, RunSummary, TimeSeries

router = APIRouter()


def _placeholder_series(start: date, end: date) -> TimeSeries:
    dates = [start.isoformat(), end.isoformat()]
    return TimeSeries(dates=dates, values=[1.0, 1.02])


@router.post("/backtest", response_model=BacktestResult)
def run_backtest(request: BacktestRequest) -> BacktestResult:
    tickers = request.tickers or settings.default_universe
    summary = RunSummary(cagr=0.12, vol=0.18, sharpe=1.1, max_drawdown=-0.08, calmar=1.5)
    return BacktestResult(
        run_id=str(uuid4()),
        summary=summary,
        equity_curve=_placeholder_series(request.start, request.end),
        drawdown=_placeholder_series(request.start, request.end),
        weights={ticker: 1 / len(tickers) for ticker in tickers},
    )
