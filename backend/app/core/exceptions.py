from __future__ import annotations

from typing import Any


class SynError(Exception):
    def __init__(self, message: str, detail: dict[str, Any] | None = None) -> None:
        self.message = message
        self.detail = detail or {}
        super().__init__(self.message)


class ConfigurationError(SynError):
    pass


class ScanError(SynError):
    pass
