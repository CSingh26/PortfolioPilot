from __future__ import annotations

from pathlib import Path
from typing import Optional

import pandas as pd

from ..config import settings


def ensure_cache_dir(path: Optional[Path] = None) -> Path:
    cache_dir = path or settings.cache_dir
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


def cache_path(name: str) -> Path:
    cache_dir = ensure_cache_dir()
    return cache_dir / f"{name}.parquet"


def read_parquet(path: Path) -> pd.DataFrame | None:
    if not path.exists():
        return None
    return pd.read_parquet(path)


def write_parquet(path: Path, frame: pd.DataFrame) -> None:
    ensure_cache_dir(path.parent)
    frame.to_parquet(path)
