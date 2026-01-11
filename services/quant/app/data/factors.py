from __future__ import annotations

import io
import zipfile
from datetime import date

import httpx
import pandas as pd

from .cache import cache_path, read_parquet, write_parquet

FRENCH_DAILY_URL = (
    "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/"
    "F-F_Research_Data_Factors_daily_CSV.zip"
)


def _parse_french_csv(content: str) -> pd.DataFrame:
    lines = content.splitlines()
    header: list[str] | None = None
    rows: list[list[str]] = []

    for line in lines:
        if not line.strip():
            continue
        if header is None and line.lower().startswith("date"):
            header = [col.strip() for col in line.split(",")]
            continue
        if header is None:
            continue
        parts = [part.strip() for part in line.split(",")]
        if not parts or not parts[0].isdigit():
            if "annual" in line.lower() or "end" in line.lower():
                break
            continue
        if len(parts) < len(header):
            continue
        rows.append(parts[: len(header)])

    if header is None:
        return pd.DataFrame()

    frame = pd.DataFrame(rows, columns=header)
    frame["Date"] = pd.to_datetime(frame["Date"], format="%Y%m%d")
    frame = frame.set_index("Date")
    frame = frame.apply(pd.to_numeric, errors="coerce")
    frame = frame / 100.0
    return frame.dropna(how="all")


def load_french_factors(start: date | None = None, end: date | None = None) -> pd.DataFrame:
    cache = cache_path("factors_ff_daily")
    cached = read_parquet(cache)
    if cached is None or cached.empty:
        cached = download_french_factors()
        if cached is not None and not cached.empty:
            write_parquet(cache, cached)

    if cached is None or cached.empty:
        return pd.DataFrame()

    if start or end:
        start_ts = pd.Timestamp(start) if start else cached.index.min()
        end_ts = pd.Timestamp(end) if end else cached.index.max()
        return cached.loc[(cached.index >= start_ts) & (cached.index <= end_ts)]

    return cached


def download_french_factors() -> pd.DataFrame:
    with httpx.Client(timeout=20.0) as client:
        response = client.get(FRENCH_DAILY_URL)
        response.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        name = archive.namelist()[0]
        content = archive.read(name).decode("latin-1")

    return _parse_french_csv(content)
