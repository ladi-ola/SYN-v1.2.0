from __future__ import annotations

import asyncio
import json
from typing import Any

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings
from app.core.exceptions import ScanError
from app.core.logging import get_logger
from app.schemas.market import Market
from app.services.market_classifier import MarketClassifier
from app.services.time_bucket import TimeBucket

logger = get_logger(__name__)

POLYMARKET_EVENT_URL = "https://polymarket.com/event"
PAGE_SIZE = 100


def normalize_market(raw: dict[str, Any]) -> Market:
    outcome_prices: list[str] = json.loads(raw["outcomePrices"])
    yes_price = float(outcome_prices[0])
    no_price = float(outcome_prices[1])

    volume = raw.get("volumeNum", float(raw.get("volume", 0)))
    volume_24h = float(raw.get("volume24hr", 0))
    liquidity = raw.get("liquidityNum", float(raw.get("liquidity", 0)))

    end_date = raw.get("endDateIso") or raw.get("endDate", "")

    events: list[dict[str, Any]] = raw.get("events", [])
    event_slug = events[0]["slug"] if events else ""
    market_url = f"{POLYMARKET_EVENT_URL}/{event_slug}" if event_slug else ""

    group_title = raw.get("groupItemTitle")
    event_title = events[0]["title"] if events else None
    category = MarketClassifier.classify(
        question=raw["question"],
        group_title=group_title,
        event_title=event_title,
    )

    tb = TimeBucket.compute(str(end_date))

    return Market(
        market_id=raw["id"],
        question=raw["question"],
        category=category,
        yes_price=yes_price,
        no_price=no_price,
        volume=float(volume),
        volume_24h=float(volume_24h),
        liquidity=float(liquidity),
        end_date=str(end_date),
        market_url=market_url,
        time_bucket=tb.time_bucket,
        historical_accuracy=tb.historical_accuracy,
    )


def _is_retryable(exc: BaseException) -> bool:
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code >= 500
    if isinstance(exc, httpx.TimeoutException):
        return True
    if isinstance(exc, httpx.ConnectError):
        return True
    return False


async def _fetch_page(
    client: httpx.AsyncClient, offset: int, semaphore: asyncio.Semaphore
) -> list[dict[str, Any]]:
    params: dict[str, Any] = {
        "limit": PAGE_SIZE,
        "active": "true",
        "closed": "false",
        "offset": offset,
    }

    @retry(
        retry=retry_if_exception_type(_is_retryable),
        stop=stop_after_attempt(settings.polymarket_max_retries),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    async def _do_fetch() -> httpx.Response:
        return await client.get(
            f"{settings.polymarket_api_url}/markets",
            params=params,
            timeout=settings.polymarket_request_timeout,
        )

    async with semaphore:
        response = await _do_fetch()
        response.raise_for_status()
        return response.json()


async def fetch_markets() -> list[Market]:
    logger.info("fetch_markets_start")
    markets: list[Market] = []
    semaphore = asyncio.Semaphore(settings.polymarket_page_concurrency)

    try:
        async with httpx.AsyncClient() as client:
            offset = 0
            stop_requested = False

            while not stop_requested:
                concurrency = settings.polymarket_page_concurrency
                offsets = [offset + i * PAGE_SIZE for i in range(concurrency)]
                tasks = [_fetch_page(client, o, semaphore) for o in offsets]

                results: list[list[dict[str, Any]]] = []
                page_stop = False

                gathered = await asyncio.gather(*tasks, return_exceptions=True)

                for idx, result in enumerate(gathered):
                    if isinstance(result, httpx.HTTPStatusError):
                        if 400 <= result.response.status_code < 500:
                            stop_requested = True
                            break
                        logger.error(
                            "fetch_page_http_error",
                            offset=offsets[idx],
                            status=result.response.status_code,
                            error=str(result),
                        )
                        page_stop = True
                        continue
                    if isinstance(result, Exception):
                        logger.error(
                            "fetch_page_error",
                            offset=offsets[idx],
                            error=str(result),
                        )
                        page_stop = True
                        continue

                    results.append(result)

                for raw_markets in results:
                    if len(raw_markets) < PAGE_SIZE:
                        page_stop = True

                    for raw in raw_markets:
                        try:
                            market = normalize_market(raw)
                            markets.append(market)
                        except Exception:
                            logger.warning(
                                "normalize_market_failed",
                                market_id=raw.get("id", "unknown"),
                                exc_info=True,
                            )

                if page_stop:
                    break

                offset += concurrency * PAGE_SIZE

        logger.info("fetch_markets_done", total=len(markets))
        return markets

    except httpx.HTTPError as exc:
        logger.error("polymarket_http_error", error=str(exc))
        raise ScanError("Failed to fetch markets from Polymarket") from exc
    except Exception as exc:
        logger.error("fetch_markets_unexpected_error", error=str(exc))
        raise ScanError("Unexpected error fetching markets") from exc
