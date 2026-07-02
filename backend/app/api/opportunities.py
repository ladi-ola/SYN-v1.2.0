from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.exceptions import ScanError
from app.core.logging import get_logger
from app.schemas.market import MarketsResponse
from app.services.market_filter import MarketFilter
from app.services.market_scorer import MarketScorer
from app.services.polymarket_service import fetch_markets

router = APIRouter()
logger = get_logger(__name__)


@router.get("/opportunities", response_model=MarketsResponse)
async def get_opportunities() -> MarketsResponse:
    logger.info("get_opportunities_request")
    try:
        markets = await fetch_markets()
        filtered = MarketFilter.apply(markets)
        ranked = MarketScorer.score_all(filtered)
    except ScanError as exc:
        logger.error("opportunities_scan_error", error=exc.message)
        raise
    except Exception as exc:
        logger.exception("opportunities_unexpected_error", error=str(exc))
        raise ScanError("Unexpected error retrieving opportunities") from exc

    return MarketsResponse(
        count=len(ranked),
        markets=ranked,
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
