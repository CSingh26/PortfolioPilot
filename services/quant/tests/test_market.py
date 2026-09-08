from datetime import date

import pandas as pd
import pytest

from app.data.market import _fetch_history
from app.data.panel import validated_prices


def test_yahoo_multiindex_normalized(monkeypatch):
    frame = pd.DataFrame(
        [[100, 99]],
        columns=pd.MultiIndex.from_tuples([("Close", "A"), ("Adj Close", "A")]),
        index=pd.to_datetime(["2024-01-01"]),
    )
    monkeypatch.setattr("app.data.market.yf.download", lambda *a, **kw: frame)
    result = _fetch_history("A", date(2024, 1, 1), date(2024, 1, 2))
    assert list(result.columns) == ["close", "adj_close"]


def test_missing_adjusted_close_rejected():
    frame = pd.DataFrame([[100], [101], [102]], columns=pd.MultiIndex.from_tuples([("A", "close")]))
    with pytest.raises(ValueError, match="Adjusted"):
        validated_prices(frame, ["A"])


def test_french_header_with_unnamed_date_column():
    from app.data.factors import _parse_french_csv

    data = _parse_french_csv("Research data\n,Mkt-RF,SMB,HML,RF\n20240102,1.0,0.2,-0.1,0.02\n")
    assert len(data) == 1
    assert data.iloc[0]["Mkt-RF"] == pytest.approx(0.01)


def test_weekly_panel_is_not_annualized_as_daily():
    frame = pd.DataFrame(
        {"A": [100, 101, 102]}, index=pd.date_range("2024-01-01", periods=3, freq="7D")
    )
    with pytest.raises(ValueError, match="daily"):
        validated_prices(frame)
