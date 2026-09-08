import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import RiskRequest

client = TestClient(app)


@pytest.fixture(autouse=True)
def offline(monkeypatch):
    monkeypatch.setattr("app.routers.risk.load_ohlcv", lambda *args: pd.DataFrame())


def payload():
    dates = pd.bdate_range("2024-01-01", periods=6).strftime("%Y-%m-%d").tolist()
    return dict(
        tickers=["A", "B"],
        start=dates[0],
        end="2024-01-09",
        alpha=0.8,
        weights={"A": 0.5, "B": 0.5},
        benchmark="A",
        risk_free=0,
        history={
            "dates": dates,
            "prices": {"A": [100, 110, 99, 99, 108.9, 98.01], "B": [100, 100, 100, 100, 100, 100]},
            "source": "hand calculation",
        },
        shocks={"A": -0.2, "B": 0.1},
    )


def test_risk_workbench_hand_calculation():
    response = client.post("/v1/risk/metrics", json=payload())
    assert response.status_code == 200, response.text
    result = response.json()
    # Five daily returns: +5%, -5%, 0%, +5%, -5%.
    assert result["volatility"] == pytest.approx(0.05 * np.sqrt(252))
    assert result["hist_var"] == pytest.approx(-0.05)
    assert result["hist_cvar"] == pytest.approx(-0.05)
    assert result["beta"] == pytest.approx(0.5)
    assert result["sharpe"] == pytest.approx(0, abs=1e-12)
    assert result["downside_deviation"] == pytest.approx(np.sqrt(0.001 * 252))
    assert result["risk_contribution"]["A"] == pytest.approx(result["volatility"])
    assert result["risk_contribution"]["B"] == 0
    assert result["stress_return"] == pytest.approx(-0.05)
    assert result["max_drawdown"] == pytest.approx(-0.052375)
    assert result["metadata"]["observations"] == 5
    assert result["metadata"]["source"] == "hand calculation"
    assert len(result["metadata"]["input_sha256"]) == 64


@pytest.mark.parametrize(
    "change",
    [
        {"weights": {"A": 0.9, "B": 0.9}},
        {"tickers": ["A", "A"]},
        {"alpha": 1},
        {"start": "2025-01-01"},
        {"risk_free": -1},
        {"tickers": ["../bad"]},
        {"shocks": {"MISSING": -0.2}},
        {"weights": {"A": -1, "B": 2}},
    ],
)
def test_invalid_inputs_rejected(change):
    value = payload() | change
    assert client.post("/v1/risk/metrics", json=value).status_code == 422


def test_missing_prices_do_not_become_zero_risk(monkeypatch):
    monkeypatch.setattr("app.routers.risk.load_ohlcv", lambda *args: pd.DataFrame())
    value = payload()
    del value["history"]
    response = client.post("/v1/risk/metrics", json=value)
    assert response.status_code == 422
    assert "unavailable" in response.text.lower()


@pytest.mark.parametrize("problem", ["duplicate", "missing", "zero", "unsorted"])
def test_price_panel_rejects_bad_observations(problem):
    value = payload()
    if problem == "duplicate":
        value["history"]["dates"][1] = value["history"]["dates"][0]
    if problem == "missing":
        value["history"]["prices"]["A"].pop()
    if problem == "zero":
        value["history"]["prices"]["A"][1] = 0
    if problem == "unsorted":
        value["history"]["dates"].reverse()
    assert client.post("/v1/risk/metrics", json=value).status_code == 422


def test_constant_prices_have_undefined_ratios():
    value = payload()
    value["history"]["prices"]["A"] = [100] * 6
    response = client.post("/v1/risk/metrics", json=value)
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["sharpe"] is None
    assert result["sortino"] is None
    assert result["beta"] is None
    assert result["diversification_ratio"] is None
    assert result["metadata"]["warnings"]


def test_request_rejects_nonfinite():
    with pytest.raises(ValueError):
        RiskRequest.model_validate(payload() | {"risk_free": float("nan")})
