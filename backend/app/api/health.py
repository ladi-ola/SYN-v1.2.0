from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, Any]:
    return {"status": "ok", "service": settings.app_name.lower()}
