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
