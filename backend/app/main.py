from __future__ import annotations

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.markets import router as markets_router
from app.api.opportunities import router as opportunities_router
from app.core.config import settings
from app.core.exceptions import SynError
from app.core.logging import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info(
        "starting_service", service=settings.app_name, version=settings.app_version
    )
    yield
    logger.info(
        "stopping_service", service=settings.app_name, version=settings.app_version
    )


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
    openapi_url=None,
    docs_url=None,
    redoc_url=None,
)

origins = [
    "http://localhost:5173",          # local development
    "https://syn-v1-2-0.vercel.app",  # production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SynError)
async def syn_error_handler(request: Request, exc: SynError) -> JSONResponse:
    logger.error("syn_error", message=exc.message, detail=exc.detail)
    return JSONResponse(
        status_code=500,
        content={"error": exc.message, "detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception,
) -> JSONResponse:
    logger.exception("unhandled_exception", error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )


@app.middleware("http")
async def log_request_middleware(request: Request, call_next: Any) -> Response:
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        elapsed_ms=round(elapsed * 1000, 3),
    )
    return response


app.include_router(health_router)
app.include_router(markets_router)
app.include_router(opportunities_router)
