from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import ClassVar

from app.core.logging import get_logger

logger = get_logger(__name__)

HOURS_4H = 4
HOURS_12H = 12
HOURS_1D = 24
HOURS_1W = 168
HOURS_1M = 720

ACCURACY: dict[str, float] = {
    "4h": 90.4,
    "12h": 82.2,
    "1d": 76.0,
    "1w": 78.9,
    "1m": 85.5,
}

_BUCKET_BOUNDARIES: list[tuple[str, int]] = [
    ("4h", HOURS_4H),
    ("12h", HOURS_12H),
    ("1d", HOURS_1D),
    ("1w", HOURS_1W),
    ("1m", HOURS_1M),
]


@dataclass
class TimeBucketResult:
    time_bucket: str
    historical_accuracy: float
    days_left: float
    hours_left: float


class TimeBucket:
    _accuracy: ClassVar[dict[str, float]] = ACCURACY

    @classmethod
    def compute(cls, end_date: str, now: datetime | None = None) -> TimeBucketResult:
        if now is None:
            now = datetime.now(timezone.utc)

        end = cls._parse_date(end_date)
        delta = end - now
        total_hours = delta.total_seconds() / 3600.0
        total_days = total_hours / 24.0

        hours_left = max(0.0, total_hours)
        days_left = max(0.0, total_days)

        bucket = cls._nearest_bucket(hours_left)
        accuracy = cls._accuracy[bucket]

        return TimeBucketResult(
            time_bucket=bucket,
            historical_accuracy=accuracy,
            days_left=round(days_left, 4),
            hours_left=round(hours_left, 4),
        )

    @classmethod
    def _parse_date(cls, raw: str) -> datetime:
        raw = raw.strip()
        for fmt in (
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S.%fZ",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d",
        ):
            try:
                dt = datetime.strptime(raw, fmt)
                return dt.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        logger.warning("time_bucket_parse_failed", raw=raw)
        return datetime.now(timezone.utc)

    @classmethod
    def _nearest_bucket(cls, hours: float) -> str:
        closest = _BUCKET_BOUNDARIES[0][0]
        min_diff = abs(hours - _BUCKET_BOUNDARIES[0][1])

        for name, boundary in _BUCKET_BOUNDARIES[1:]:
            diff = abs(hours - boundary)
            if diff <= min_diff:
                min_diff = diff
                closest = name

        return closest
