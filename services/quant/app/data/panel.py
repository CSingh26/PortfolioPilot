"""Strict shared adjusted-price contract: no imputation or asset substitution."""

import numpy as np
import pandas as pd


def validated_prices(frame: pd.DataFrame, tickers: list[str] | None = None) -> pd.DataFrame:
    if frame.empty:
        raise ValueError("Price data unavailable; supply a complete adjusted-price panel")
    if isinstance(frame.columns, pd.MultiIndex):
        if "adj_close" not in frame.columns.get_level_values(1):
            raise ValueError(
                "Adjusted close unavailable; raw closes cannot replace total-return inputs"
            )
        frame = frame.xs("adj_close", level=1, axis=1)
    if tickers is not None:
        if set(tickers) - set(frame.columns):
            raise ValueError("Price data unavailable for one or more requested assets")
        frame = frame.loc[:, tickers]
    if frame.index.has_duplicates or not frame.index.is_monotonic_increasing:
        raise ValueError("Price dates must be unique and chronological")
    if len(frame) < 3 or frame.shape[1] == 0:
        raise ValueError("At least three price observations are required")
    if not np.isfinite(frame.to_numpy(dtype=float)).all() or (frame <= 0).any().any():
        raise ValueError("Prices must be finite, positive and complete for every asset/date")
    return frame.astype(float)
