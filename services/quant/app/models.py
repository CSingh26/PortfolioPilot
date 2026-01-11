from datetime import date
from typing import Literal
from pydantic import BaseModel, Field

StrategyName = Literal[
    "buy_and_hold",
    "equal_weight",
    "momentum_12_1",
    "min_variance",
    "risk_parity",
    "vol_target",
    "cvar_min",
]


class TimeSeries(BaseModel):
    dates: list[str]
    values: list[float]


class WeightSeries(BaseModel):
    dates: list[str]
    weights: dict[str, list[float]]


class RunSummary(BaseModel):
    cagr: float
    vol: float
    sharpe: float
    max_drawdown: float
    calmar: float


class BacktestRequest(BaseModel):
    tickers: list[str] = Field(default_factory=list)
    start: date
    end: date
    strategy: StrategyName
    rebalance: str = Field(default="M", description="Pandas offset alias, e.g. M, W, Q")
    transaction_cost_bps: float = 5.0
    slippage_bps: float = 2.0
    benchmark: str = "SPY"
    risk_free: float | None = None
    lookback_window: int = 126
    max_weight: float | None = None
    vol_target: float | None = None


class BacktestResult(BaseModel):
    run_id: str
    summary: RunSummary
    equity_curve: TimeSeries
    returns: TimeSeries
    drawdown: TimeSeries
    weights: WeightSeries
    turnover: TimeSeries
    costs: TimeSeries


class OptimizationRequest(BaseModel):
    tickers: list[str]
    method: Literal["mvo", "risk_parity", "cvar"]
    target_return: float | None = None
    max_weight: float | None = None
    risk_free: float | None = None


class OptimizationResult(BaseModel):
    weights: dict[str, float]
    expected_return: float
    expected_vol: float
    sharpe: float


class RiskRequest(BaseModel):
    tickers: list[str]
    start: date
    end: date
    alpha: float = 0.95


class RiskMetrics(BaseModel):
    var: float
    cvar: float
    volatility: float
