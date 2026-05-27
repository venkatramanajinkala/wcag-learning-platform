import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import get_settings


def generate_reset_token() -> str:
    # URL-safe and long enough for brute-force resistance.
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def reset_token_expiry() -> datetime:
    settings = get_settings()
    return datetime.now(timezone.utc) + timedelta(minutes=settings.reset_token_expire_minutes)
