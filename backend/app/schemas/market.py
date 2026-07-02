from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class Market(BaseModel):
    market_id: str
    question: str
    category: str
    yes_price: float
    no_price: float
    volume: float
    volume_24h: float
    liquidity: float
    end_date: str
    market_url: str
    time_bucket: str
    historical_accuracy: float
    volume_score: float = 0.0
    price_score: float = 0.0
    final_score: float = 0.0


class MarketsResponse(BaseModel):
    count: int
    markets: list[Market]
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
