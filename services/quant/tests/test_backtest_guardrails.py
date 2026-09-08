import numpy as np
import pandas as pd
import pytest

from app.backtest.engine import _rebalance_dates, run_backtest
from app.optimize import min_variance_long_only, risk_parity_weights, target_return_long_only


def test_buy_hold_drifts_and_charges_initial_capital():
    prices = pd.DataFrame(
        {"A": [100, 200, 100], "B": [100, 100, 100]}, index=pd.bdate_range("2024-01-01", periods=3)
    )
    result = run_backtest(prices, "buy_and_hold", transaction_cost_bps=100, slippage_bps=0)
    assert result.equity_curve.iloc[0] == pytest.approx(0.99)
    assert result.equity_curve.iloc[-1] == pytest.approx(0.99)
    assert result.weights.iloc[1]["A"] == pytest.approx(2 / 3)
    assert result.turnover.sum() == pytest.approx(1)


def test_month_end_uses_last_trading_day():
    prices = pd.DataFrame({"A": [100] * 23}, index=pd.bdate_range("2024-03-01", periods=23))
    assert pd.Timestamp("2024-03-29") in _rebalance_dates(prices, "M")


def test_future_price_change_cannot_change_prior_exposure():
    idx = pd.bdate_range("2024-01-01", periods=90)
    prices = pd.DataFrame(
        {
            "A": 100 * np.cumprod(1 + np.sin(np.arange(90)) * 0.01),
            "B": 100 * np.cumprod(1 + np.cos(np.arange(90)) * 0.01),
        },
        index=idx,
    )
    original = run_backtest(prices, "vol_target", lookback=21)
    changed = prices.copy()
    changed.iloc[-1, 0] *= 1.4
    perturbed = run_backtest(changed, "vol_target", lookback=21)
    pd.testing.assert_frame_equal(original.weights.iloc[:-1], perturbed.weights.iloc[:-1])
    pd.testing.assert_series_equal(original.returns.iloc[:-1], perturbed.returns.iloc[:-1])
    # Last-day return must use holdings fixed at the preceding close, without same-day scaling.
    previous = original.weights.iloc[-2].values
    gross = previous @ (changed.iloc[-1].values / changed.iloc[-2].values - 1)
    assert perturbed.returns.iloc[-1] == pytest.approx(gross)


@pytest.mark.parametrize("cost", [-1, float("nan")])
def test_bad_costs_rejected(cost):
    prices = pd.DataFrame({"A": [100, 101, 102]}, index=pd.bdate_range("2024-01-01", periods=3))
    with pytest.raises(ValueError):
        run_backtest(prices, "buy_and_hold", transaction_cost_bps=cost)


def test_optimizer_infeasible_cap_is_not_equal_weight_fallback():
    with pytest.raises(ValueError):
        min_variance_long_only(np.eye(2), max_weight=0.4)


def test_optimizer_infeasible_target_is_not_equal_weight_fallback():
    with pytest.raises(ValueError):
        target_return_long_only(np.array([0.05, 0.1]), np.eye(2), 0.5)


def test_risk_parity_diagonal_has_equal_contributions():
    cov = pd.DataFrame(np.diag([0.01, 0.04, 0.09]))
    w = risk_parity_weights(cov)
    np.testing.assert_allclose(w, np.array([6, 3, 2]) / 11, atol=1e-5)


def test_warmup_requires_at_least_one_invested_return():
    prices = pd.DataFrame(
        {"A": np.arange(22) + 100}, index=pd.bdate_range("2024-01-01", periods=22)
    )
    with pytest.raises(ValueError, match="warm-up"):
        run_backtest(prices, "vol_target", lookback=21)


def test_cap_not_silently_ignored_by_equal_weight_strategy():
    prices = pd.DataFrame(
        {"A": [100, 101, 102], "B": [100, 102, 104]}, index=pd.bdate_range("2024-01-01", periods=3)
    )
    with pytest.raises(ValueError, match="caps"):
        run_backtest(prices, "equal_weight", max_weight=0.6)


def test_unconstrained_tangency_rejects_negative_normalization():
    from app.optimize import max_sharpe_unconstrained

    with pytest.raises(ValueError, match="tangency"):
        max_sharpe_unconstrained(np.array([-0.1, -0.2]), np.eye(2))


def test_route_annualizes_elapsed_intervals_including_initial_cost(monkeypatch):
    from fastapi.testclient import TestClient

    from app.main import app

    prices = pd.DataFrame(
        {"A": [100, 100.2, 100.4004], "B": [100, 100.1, 100.2001]},
        index=pd.bdate_range("2024-01-01", periods=3),
    )
    monkeypatch.setattr("app.routers.backtest.load_ohlcv", lambda *a: prices)
    response = TestClient(app).post(
        "/v1/backtest",
        json={
            "tickers": ["A", "B"],
            "start": "2024-01-01",
            "end": "2024-01-04",
            "strategy": "buy_and_hold",
            "transaction_cost_bps": 10,
            "slippage_bps": 0,
        },
    )
    assert response.status_code == 200, response.text
    result = response.json()
    terminal = 0.999 * ((1.002**2 + 1.001**2) / 2)
    assert result["summary"]["cagr"] == pytest.approx(terminal ** (252 / 2) - 1)
    actual = np.array(result["returns"]["values"][1:])
    assert result["summary"]["vol"] == pytest.approx(actual.std(ddof=1) * np.sqrt(252))


def test_backtest_undefined_ratios_and_compatibility_benchmark_are_explicit(monkeypatch):
    from fastapi.testclient import TestClient

    from app.main import app

    prices = pd.DataFrame({"A": [100, 100, 100]}, index=pd.bdate_range("2024-01-01", periods=3))
    monkeypatch.setattr("app.routers.backtest.load_ohlcv", lambda *a: prices)
    response = TestClient(app).post(
        "/v1/backtest",
        json={
            "tickers": ["A"],
            "start": "2024-01-01",
            "end": "2024-01-04",
            "strategy": "buy_and_hold",
            "transaction_cost_bps": 0,
            "slippage_bps": 0,
            "benchmark": "SPY",
        },
    )
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["summary"]["sharpe"] is None
    assert result["summary"]["calmar"] is None
    assert any("SPY" in warning and "not used" in warning for warning in result["warnings"])
    assert any("undefined" in warning.lower() for warning in result["warnings"])


def test_backtest_sharpe_is_unavailable_without_observations():
    from app.analytics.metrics import sharpe_ratio

    assert sharpe_ratio(pd.Series(dtype=float)) is None
    assert sharpe_ratio(pd.Series([0.01])) is None
