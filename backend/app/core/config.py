from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

_env_file = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_env_file)


class Settings(BaseSettings):
    app_name: str = "Syn"
    app_version: str = "1.2.0"
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    polymarket_api_url: str = "https://gamma-api.polymarket.com"
    polymarket_request_timeout: int = 30
    polymarket_max_retries: int = 3
    polymarket_page_concurrency: int = 10

    min_no_price: float = 0.50
    min_volume: float = 25000.0
    longshot_high: float = 0.991
    longshot_low: float = 0.009
    include_longshots: bool = False

    weight_volume: float = 0.40
    weight_price: float = 0.35
    weight_historical: float = 0.25

    model_config = {
        "env_prefix": "SYN_",
        "case_sensitive": False,
        "env_file": str(_env_file),
        "extra": "ignore",
    }


settings = Settings()
