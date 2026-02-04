from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.v1 import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if settings.scheduler_enabled:
        from app.services.scheduler import start_scheduler, shutdown_scheduler

        start_scheduler()
        yield
        shutdown_scheduler()
    else:
        yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_v1_router, prefix="/api/v1")

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "app": settings.app_name}

    return app


app = create_app()
