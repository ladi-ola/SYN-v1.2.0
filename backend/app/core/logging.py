from __future__ import annotations

import logging
from typing import Any

import structlog
from structlog.typing import EventDict, Processor

from app.core.config import settings


def _add_app_metadata(
    logger: logging.Logger, method_name: str, event_dict: EventDict
) -> EventDict:
    event_dict["app"] = settings.app_name
    event_dict["version"] = settings.app_version
    return event_dict


def _drop_color_message_key_processor(
    logger: logging.Logger, method_name: str, event_dict: EventDict
) -> EventDict:
    event_dict.pop("color_message", None)
    return event_dict


def _setup_structlog() -> None:
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        _add_app_metadata,  # type: ignore[arg-type]
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.dev.set_exc_info,  # type: ignore[arg-type]
        _drop_color_message_key_processor,  # type: ignore[arg-type]
    ]

    structlog.configure(
        processors=shared_processors
        + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processor=structlog.dev.ConsoleRenderer(colors=False),
        foreign_pre_chain=shared_processors,
    )

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(settings.log_level.upper())


_setup_structlog()


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    return structlog.stdlib.get_logger(name)
