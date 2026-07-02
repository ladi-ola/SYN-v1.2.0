from __future__ import annotations

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.market import Market

logger = get_logger(__name__)


class MarketFilter:
    @staticmethod
    def apply(markets: list[Market]) -> list[Market]:
        logger.info(
            "filter_start",
            input=len(markets),
            min_no_price=settings.min_no_price,
            min_volume=settings.min_volume,
            include_longshots=settings.include_longshots,
        )

        filtered: list[Market] = []
        skipped_price = 0
        skipped_volume = 0
        skipped_longshot = 0

        for market in markets:
            if market.no_price < settings.min_no_price:
                skipped_price += 1
                continue

            if market.volume < settings.min_volume:
                skipped_volume += 1
                continue

            if not settings.include_longshots:
                if market.no_price >= settings.longshot_high:
                    skipped_longshot += 1
                    continue
                if market.no_price <= settings.longshot_low:
                    skipped_longshot += 1
                    continue

            filtered.append(market)

        logger.info(
            "filter_done",
            output=len(filtered),
            skipped_price=skipped_price,
            skipped_volume=skipped_volume,
            skipped_longshot=skipped_longshot,
        )

        return filtered
