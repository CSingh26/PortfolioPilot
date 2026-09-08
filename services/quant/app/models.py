import math
import re
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

StrategyName = Literal[
    "buy_and_hold",
    "equal_weight",
    "momentum_12_1",
    "min_variance",
    "risk_parity",
    "vol_target",
    "cvar_min",
]


class MarketRequest(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)
    tickers: list[str] = Field(min_length=1, max_length=25)
    start: date
    end: date

    @model_validator(mode="after")
    def validate_market(self):
        if self.start >= self.end:
            raise ValueError("start must precede end (exclusive)")
        if len(set(self.tickers)) != len(self.tickers):
            raise ValueError("tickers must be unique")
        if any(not re.fullmatch(r"[A-Z0-9^][A-Z0-9.^=-]{0,14}", t) for t in self.tickers):
            raise ValueError("invalid ticker symbol")
        return self


class PriceHistory(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)
    dates: list[date] = Field(min_length=3, max_length=10000)
    prices: dict[str, list[float]]
    source: str = Field(min_length=1, max_length=200)


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


class BacktestRequest(MarketRequest):
    strategy: StrategyName
    rebalance: Literal["M", "W", "Q"] = "M"
    transaction_cost_bps: float = Field(default=5.0, ge=0, le=1000)
    slippage_bps: float = Field(default=2.0, ge=0, le=1000)
    benchmark: str = "SPY"
    risk_free: float | None = Field(default=None, gt=-1, le=1)
    lookback_window: int = Field(default=126, ge=21, le=1260)
    max_weight: float | None = Field(default=None, gt=0, le=1)
    vol_target: float | None = Field(default=None, gt=0, le=1)


class BacktestResult(BaseModel):
    run_id: str
    summary: RunSummary
    equity_curve: TimeSeries
    returns: TimeSeries
    drawdown: TimeSeries
    weights: WeightSeries
    turnover: TimeSeries
    costs: TimeSeries


class OptimizationRequest(MarketRequest):
    method: Literal["mvo", "risk_parity", "cvar"]
    target_return: float | None = None
    max_weight: float | None = Field(default=None, gt=0, le=1)
    risk_free: float | None = Field(default=None, gt=-1, le=1)
    alpha: float = Field(default=0.95, gt=0.5, lt=1)
    frontier_points: int = Field(default=25, ge=2, le=100)
    long_only: bool = True


class FrontierPoint(BaseModel):
    expected_return: float
    expected_vol: float


class OptimizationResult(BaseModel):
    weights: dict[str, float]
    expected_return: float
    expected_vol: float
    sharpe: float
    frontier: list[FrontierPoint] | None = None


class RiskRequest(MarketRequest):
    alpha: float = Field(default=0.95, gt=0.5, lt=1)
    weights: dict[str, float] | None = None
    benchmark: str = Field(default="SPY", pattern=r"^[A-Z0-9^][A-Z0-9.^=-]{0,14}$")
    risk_free: float = Field(default=0, gt=-1, le=1)
    history: PriceHistory | None = None
    shocks: dict[str, float] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_allocation(self):
        if self.weights is not None:
            if set(self.weights) != set(self.tickers):
                raise ValueError("weights must match tickers")
            if any(w < 0 or not math.isfinite(w) for w in self.weights.values()):
                raise ValueError("weights must be finite and nonnegative")
            if not math.isclose(sum(self.weights.values()), 1, abs_tol=1e-8):
                raise ValueError("weights must sum to one")
        if not set(self.shocks).issubset(self.tickers):
            raise ValueError("shocks must refer to portfolio tickers")
        if any(not math.isfinite(x) or x < -1 or x > 10 for x in self.shocks.values()):
            raise ValueError("shocks must be finite decimal returns between -1 and 10")
        return self


class RiskMetrics(BaseModel):
    hist_var: float
    hist_cvar: float
    param_var: float
    param_cvar: float
    volatility: float
    rolling_vol: TimeSeries
    rolling_sharpe: TimeSeries
    expected_return: float
    excess_return: float
    cagr: float
    sharpe: float | None
    sortino: float | None
    downside_deviation: float
    max_drawdown: float
    beta: float | None
    capm_return: float | None
    alpha: float | None
    benchmark_return: float
    diversification_ratio: float | None
    risk_contribution: dict[str, float]
    asset_metrics: dict[str, dict[str, float | None]]
    covariance: dict[str, dict[str, float]]
    correlation: dict[str, dict[str, float | None]]
    stress_return: float
    returns: TimeSeries
    equity_curve: TimeSeries
    drawdown: TimeSeries
    metadata: dict


class FactorRegressionRequest(MarketRequest):
    pass


class FactorRegressionResult(BaseModel):
    coefficients: dict[str, float]
    tstats: dict[str, float]
    r2: float
