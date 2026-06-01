"""
config.py
---------
Application settings loaded from environment / .env file.
New additions vs original:
  - google_search_api_key  (Google Custom Search JSON API key)
  - google_search_cx       (Programmable Search Engine ID / cx)
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "A11yPlay API"
    environment: str = "development"
    secret_key: str = "change-this-before-production"
    access_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./a11yplay.db"
    backend_cors_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "https://a11y-learning.netlify.app"
    )
    backend_cors_origin_regex: str = r"https://.*\.netlify\.app"
    frontend_url: str = "http://localhost:3000"
    reset_token_expire_minutes: int = 30

    # Email
    email_provider: str = "smtp"
    email_from: str = ""
    resend_api_key: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "no-reply@example.com"
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False

    # OAuth
    google_client_id: str = ""

    # Groq LLM
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"

    # ── NEW: Google Custom Search ─────────────────────────────────────────
    # Get these from https://programmablesearchengine.google.com/
    # and https://console.developers.google.com/ (Custom Search JSON API)
    google_search_api_key: str = ""
    google_search_cx: str = ""          # Search Engine ID (cx)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.backend_cors_origins.split(",") if o.strip()]

    @property
    def sender_email(self) -> str:
        return self.email_from or self.smtp_from

    @property
    def live_search_enabled(self) -> bool:
        """True when Google Search credentials are present."""
        return bool(self.google_search_api_key and self.google_search_cx)


@lru_cache
def get_settings() -> Settings:
    return Settings()