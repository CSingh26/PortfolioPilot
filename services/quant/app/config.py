from pathlib import Path
from pydantic_settings import BaseSettings

DEFAULT_UNIVERSE = [
    "SPY",
    "QQQ",
    "IWM",
    "EFA",
    "EEM",
    "AGG",
    "GLD",
    "VNQ",
    "TLT",
    "LQD",
]


class Settings(BaseSettings):
    data_dir: Path = Path("data")
    cache_dir: Path = Path("data/cache")
    runs_dir: Path = Path("data/runs")
    fred_api_key: str | None = None
    default_universe: list[str] = DEFAULT_UNIVERSE

    class Config:
        env_prefix = "QUANT_"


settings = Settings()
