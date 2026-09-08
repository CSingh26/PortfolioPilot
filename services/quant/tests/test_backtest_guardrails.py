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
