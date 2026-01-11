from __future__ import annotations

from datetime import date
from typing import Iterable

import pandas as pd
import yfinance as yf

from .cache import cache_path, read_parquet, write_parquet


def _normalize_columns(frame: pd.DataFrame) -> pd.DataFrame:
    rename_map = {
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Adj Close": "adj_close",
        "Volume": "volume",
    }
    return frame.rename(columns=rename_map)


def _fetch_history(ticker: str, start: date, end: date) -> pd.DataFrame:
    frame = yf.download(
        ticker,
        start=start,
        end=end,
        auto_adjust=False,
        progress=False,
        group_by="column",
    )
    if frame.empty:
        return frame
    frame = _normalize_columns(frame)
    frame.index = pd.to_datetime(frame.index).tz_localize(None)
    return frame


def load_ticker_ohlcv(ticker: str, start: date, end: date) -> pd.DataFrame:
    path = cache_path(f"ohlcv_{ticker}")
    cached = read_parquet(path)
    start_ts = pd.Timestamp(start)
    end_ts = pd.Timestamp(end)

    needs_fetch = cached is None or cached.empty
    if cached is not None and not cached.empty:
        cached.index = pd.to_datetime(cached.index).tz_localize(None)
        if start_ts < cached.index.min() or end_ts > cached.index.max():
            needs_fetch = True

    if needs_fetch:
        fetched = _fetch_history(ticker, start, end)
        if cached is not None and not cached.empty:
            combined = pd.concat([cached, fetched]).sort_index()
            combined = combined[~combined.index.duplicated(keep="last")]
        else:
            combined = fetched
        if not combined.empty:
            write_parquet(path, combined)
        data = combined
    else:
        data = cached

    if data is None or data.empty:
        return pd.DataFrame()

    sliced = data.loc[(data.index >= start_ts) & (data.index <= end_ts)]
    return sliced


def load_ohlcv(tickers: Iterable[str], start: date, end: date) -> pd.DataFrame:
    frames: dict[str, pd.DataFrame] = {}
    for ticker in tickers:
        frames[ticker] = load_ticker_ohlcv(ticker, start, end)

    if not frames:
        return pd.DataFrame()

    combined = pd.concat(frames, axis=1)
    return combined.sort_index()
