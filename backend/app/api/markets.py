from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.exceptions import ScanError
from app.core.logging import get_logger
from app.schemas.market import MarketsResponse
from app.services.polymarket_service import fetch_markets

router = APIRouter()
logger = get_logger(__name__)


@router.get("/markets", response_model=MarketsResponse)
async def get_markets() -> MarketsResponse:
    logger.info("get_markets_request")
    try:
        markets = await fetch_markets()
    except ScanError as exc:
        logger.error("markets_scan_error", error=exc.message)
        raise
    except Exception as exc:
        logger.exception("markets_unexpected_error", error=str(exc))
        raise ScanError("Unexpected error retrieving markets") from exc

    return MarketsResponse(
        count=len(markets),
        markets=markets,
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
