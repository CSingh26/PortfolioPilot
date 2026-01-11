from __future__ import annotations

from datetime import date

import httpx
import pandas as pd

from ..config import settings

FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"


def fetch_fred_series(
    series_id: str = "DGS3MO",
    start: date | None = None,
    end: date | None = None,
    api_key: str | None = None,
) -> pd.Series:
    key = api_key or settings.fred_api_key
    if not key:
        return pd.Series(dtype=float)

    params = {
        "api_key": key,
        "series_id": series_id,
        "file_type": "json",
    }
    if start:
        params["observation_start"] = start.isoformat()
    if end:
        params["observation_end"] = end.isoformat()

    with httpx.Client(timeout=20.0) as client:
        response = client.get(FRED_BASE_URL, params=params)
        response.raise_for_status()
        payload = response.json()

    observations = payload.get("observations", [])
    if not observations:
        return pd.Series(dtype=float)

    dates = [obs["date"] for obs in observations]
    values = [float(obs["value"]) if obs["value"] != "." else None for obs in observations]
    series = pd.Series(values, index=pd.to_datetime(dates), dtype=float)
    series.name = series_id
    return series.dropna()
