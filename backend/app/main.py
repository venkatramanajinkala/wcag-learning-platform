from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api import audit, auth, oauth, progress
from app.core.config import get_settings
from app.db import Base, engine

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.state.limiter = auth.limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api")
    app.include_router(oauth.router, prefix="/api")
    app.include_router(progress.router, prefix="/api")
    app.include_router(audit.router, prefix="/api")

    @app.on_event("startup")
    def create_tables() -> None:
        Base.metadata.create_all(bind=engine)

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok", "environment": settings.environment}

    return app


app = create_app()
