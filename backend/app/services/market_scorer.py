from __future__ import annotations

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.market import Market

logger = get_logger(__name__)

_VOLUME_BUCKETS: list[tuple[float, float, float]] = [
    (25000, 50000, 10),
    (50000, 100000, 25),
    (100000, 250000, 45),
    (250000, 500000, 65),
    (500000, 1000000, 85),
    (1000000, float("inf"), 100),
]


class MarketScorer:
    @staticmethod
    def score_all(markets: list[Market]) -> list[Market]:
        logger.info("scorer_start", input=len(markets))

        for market in markets:
            market.volume_score = MarketScorer._compute_volume(market.volume)
            market.price_score = MarketScorer._compute_price(market.no_price)
            market.final_score = (
                market.volume_score * settings.weight_volume
                + market.price_score * settings.weight_price
                + market.historical_accuracy * settings.weight_historical
            )

        markets.sort(key=lambda m: m.final_score, reverse=True)

        logger.info("scorer_done", output=len(markets))
        return markets

    @staticmethod
    def _compute_volume(volume: float) -> float:
        for low, high, score in _VOLUME_BUCKETS:
            if low <= volume < high:
                return score
        return 0.0

    @staticmethod
    def _compute_price(no_price: float) -> float:
        raw = ((1.0 - no_price) / (1.0 - settings.min_no_price)) * 100.0
        return max(0.0, min(100.0, raw))
